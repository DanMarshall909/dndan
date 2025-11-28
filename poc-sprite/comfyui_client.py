"""
Minimal ComfyUI client for POC sprite generation.
Mirrors the pattern from src/server/image-generator.ts
"""

import asyncio
import json
import httpx
import websockets
from typing import Optional


class ComfyUIClient:
    """Client for interacting with ComfyUI API"""

    def __init__(self, base_url: str = "http://localhost:8188"):
        self.base_url = base_url
        self.timeout = 120.0  # 2 minutes like image-generator.ts

    async def is_available(self) -> bool:
        """Check if ComfyUI is running and responsive"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/system_stats", timeout=5.0
                )
                return response.status_code == 200
        except Exception:
            return False

    async def generate_image(
        self, prompt: str, negative_prompt: str, seed: int, width: int = 128, height: int = 128
    ) -> Optional[bytes]:
        """
        Generate a single image using ComfyUI workflow

        Args:
            prompt: Positive prompt for image generation
            negative_prompt: Negative prompt (what to avoid)
            seed: Random seed for reproducibility
            width: Image width in pixels
            height: Image height in pixels

        Returns:
            Image data as bytes, or None if generation fails
        """
        workflow = self._create_workflow(prompt, negative_prompt, seed, width, height)
        client_id = self._generate_client_id()

        try:
            # Queue the prompt
            prompt_id = await self._queue_prompt(workflow, client_id)

            # Wait for completion via WebSocket
            await self._wait_for_completion(prompt_id, client_id)

            # Retrieve generated image
            image_data = await self._get_generated_image(prompt_id)

            return image_data

        except Exception as e:
            print(f"[ComfyUI] Generation failed: {e}")
            return None

    def _create_workflow(
        self, prompt: str, negative_prompt: str, seed: int, width: int, height: int
    ) -> dict:
        """Create ComfyUI workflow JSON (mirrors image-generator.ts)"""
        return {
            "3": {
                "inputs": {
                    "seed": seed,
                    "steps": 15,  # Reduced for POC speed
                    "cfg": 7.5,
                    "sampler_name": "euler_a",
                    "scheduler": "normal",
                    "denoise": 1,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0],
                },
                "class_type": "KSampler",
            },
            "4": {
                "inputs": {"ckpt_name": "v1-5-pruned-emaonly.safetensors"},
                "class_type": "CheckpointLoaderSimple",
            },
            "5": {
                "inputs": {"width": width, "height": height, "batch_size": 1},
                "class_type": "EmptyLatentImage",
            },
            "6": {
                "inputs": {"text": prompt, "clip": ["4", 1]},
                "class_type": "CLIPTextEncode",
            },
            "7": {
                "inputs": {"text": negative_prompt, "clip": ["4", 1]},
                "class_type": "CLIPTextEncode",
            },
            "8": {
                "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
                "class_type": "VAEDecode",
            },
            "9": {
                "inputs": {"filename_prefix": "poc_sprite", "images": ["8", 0]},
                "class_type": "SaveImage",
            },
        }

    def _generate_client_id(self) -> str:
        """Generate unique client ID"""
        import time
        import random
        import string

        timestamp = int(time.time() * 1000)
        rand_str = "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
        return f"poc-{timestamp}-{rand_str}"

    async def _queue_prompt(self, workflow: dict, client_id: str) -> str:
        """Queue a prompt for generation"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.base_url}/prompt",
                json={"prompt": workflow, "client_id": client_id},
            )

            if response.status_code != 200:
                raise Exception(
                    f"Failed to queue prompt: {response.status_code} {response.text}"
                )

            data = response.json()
            return data["prompt_id"]

    async def _wait_for_completion(self, prompt_id: str, client_id: str):
        """Wait for image generation to complete via WebSocket"""
        ws_url = self.base_url.replace("http", "ws")

        async with websockets.connect(
            f"{ws_url}/ws?clientId={client_id}"
        ) as websocket:
            timeout_task = asyncio.create_task(asyncio.sleep(self.timeout))
            message_task = None

            try:
                while True:
                    if message_task is None:
                        message_task = asyncio.create_task(websocket.recv())

                    done, pending = await asyncio.wait(
                        [timeout_task, message_task],
                        return_when=asyncio.FIRST_COMPLETED,
                    )

                    if timeout_task in done:
                        raise Exception("Timeout waiting for image generation")

                    if message_task in done:
                        data = message_task.result()
                        message_task = None

                        message = json.loads(data)

                        # Check for completion
                        if message.get("type") == "executing":
                            msg_data = message.get("data", {})
                            if (
                                msg_data.get("node") is None
                                and msg_data.get("prompt_id") == prompt_id
                            ):
                                # Generation complete
                                timeout_task.cancel()
                                return

                        # Check for errors
                        if message.get("type") == "execution_error":
                            raise Exception(
                                f"Execution error: {message.get('data')}"
                            )

            except asyncio.CancelledError:
                pass
            finally:
                timeout_task.cancel()
                if message_task and not message_task.done():
                    message_task.cancel()

    async def _get_generated_image(self, prompt_id: str) -> bytes:
        """Retrieve generated image from ComfyUI"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get history to find output filename
            history_response = await client.get(f"{self.base_url}/history/{prompt_id}")

            if history_response.status_code != 200:
                raise Exception(
                    f"Failed to get history: {history_response.status_code}"
                )

            history = history_response.json()
            outputs = history.get(prompt_id, {}).get("outputs", {})

            # Find the saved image
            for node_id, node_output in outputs.items():
                if "images" in node_output:
                    for image in node_output["images"]:
                        filename = image["filename"]
                        subfolder = image.get("subfolder", "")
                        image_type = image.get("type", "output")

                        # Retrieve the image
                        params = {
                            "filename": filename,
                            "subfolder": subfolder,
                            "type": image_type,
                        }
                        image_response = await client.get(
                            f"{self.base_url}/view", params=params
                        )

                        if image_response.status_code == 200:
                            return image_response.content

            raise Exception("No images found in output")
