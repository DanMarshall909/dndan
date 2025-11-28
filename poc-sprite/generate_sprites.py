"""
POC: Isometric Sprite Animation Generator

Generates 4-frame walk cycles for test entities using ComfyUI.
Demonstrates visual consistency and technical feasibility.
"""

import asyncio
import hashlib
import time
from pathlib import Path
from io import BytesIO
from PIL import Image

from comfyui_client import ComfyUIClient
from sprite_packer import SpriteSheetPacker


# Test entities for POC
TEST_ENTITIES = [
    {
        "name": "goblin",
        "description": "small green-skinned goblin warrior with ragged leather armor and rusty dagger",
    },
    {
        "name": "fighter",
        "description": "human fighter in polished plate armor with longsword and shield",
    },
    {
        "name": "skeleton",
        "description": "animated skeleton archer with tattered hooded cloak and bone bow",
    },
]

# Animation poses for 4-frame walk cycle
WALK_POSES = [
    "standing idle, centered pose",
    "mid-stride walking, left foot forward",
    "standing idle, centered pose",
    "mid-stride walking, right foot forward",
]


def get_sprite_seed(entity_name: str, animation: str, frame: int) -> int:
    """
    Deterministic seed calculation for reproducibility

    Same entity + animation + frame = same sprite every time
    """
    base_seed = int(hashlib.md5(entity_name.encode()).hexdigest()[:8], 16)
    animation_offset = {"walk": 1000, "idle": 0, "attack": 2000}
    return base_seed + animation_offset.get(animation, 0) + frame


def build_prompt(entity_description: str, pose: str, style: str = "16-bit SNES pixel art") -> str:
    """
    Build consistent prompt for sprite generation

    Uses template system for structural consistency
    """
    return f"""
isometric pixel art sprite, {entity_description},
{pose},
{style}, clean pixel art,
45-degree angle top-down view,
single character centered in frame,
transparent background,
retro RPG game aesthetic,
crisp pixels, no anti-aliasing,
clear silhouette
""".strip()


NEGATIVE_PROMPT = """
multiple characters, duplicate sprites,
blurry, smooth gradients, anti-aliasing,
3d render, realistic, photograph,
shadows on ground, ground plane,
perspective distortion,
text, watermark, UI elements,
different art styles, inconsistent style
""".strip()


async def generate_walk_cycle(
    client: ComfyUIClient, entity: dict, output_dir: Path
) -> dict:
    """
    Generate 4-frame walk cycle for an entity

    Returns validation results
    """
    entity_name = entity["name"]
    entity_desc = entity["description"]

    print(f"\n[POC] Generating {entity_name.capitalize()}...")

    frames = []
    timings = []

    for frame_idx, pose in enumerate(WALK_POSES):
        start_time = time.time()

        # Calculate deterministic seed
        seed = get_sprite_seed(entity_name, "walk", frame_idx)

        # Build prompt
        prompt = build_prompt(entity_desc, pose)

        print(f"  Frame {frame_idx}/4: {pose[:30]}...", end=" ", flush=True)

        # Generate image
        image_data = await client.generate_image(
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            seed=seed,
            width=128,  # Generate larger, will downscale
            height=128,
        )

        if image_data is None:
            print("✗ FAILED")
            return {"error": f"Frame {frame_idx} generation failed"}

        # Convert to PIL Image
        img = Image.open(BytesIO(image_data))

        # Normalize to 32x32
        img_normalized = SpriteSheetPacker.normalize_sprite(img, (32, 32))

        # Save individual frame
        entity_dir = output_dir / entity_name
        entity_dir.mkdir(parents=True, exist_ok=True)
        img_normalized.save(entity_dir / f"walk_{frame_idx}.png")

        frames.append(img_normalized)

        elapsed = time.time() - start_time
        timings.append(elapsed)
        print(f"✓ ({elapsed:.1f}s)")

    # Pack sprite sheet
    print("  Packing sprite sheet...", end=" ", flush=True)
    packer = SpriteSheetPacker()
    sprite_sheet, metadata = packer.pack(frames, entity_name, "walk")

    # Save sprite sheet and metadata
    SpriteSheetPacker.save_sprite_sheet(
        sprite_sheet, metadata, str(output_dir), entity_name
    )
    print("✓")

    # Validate consistency
    print("  Validating consistency...", end=" ", flush=True)
    validation = validate_sprites(frames)
    print(f"✓ (similarity: {validation['visual_similarity']:.0%})")

    return {
        "entity": entity_name,
        "frames": len(frames),
        "avg_time": sum(timings) / len(timings),
        "total_time": sum(timings),
        "validation": validation,
    }


def validate_sprites(frames: list[Image.Image]) -> dict:
    """
    Validate sprite consistency

    Checks:
    - Size consistency
    - Transparency
    - Visual similarity (simplified)
    """
    if not frames:
        return {"passes": False, "error": "No frames"}

    results = {
        "size_consistent": all(f.size == frames[0].size for f in frames),
        "has_transparency": all(f.mode == "RGBA" for f in frames),
        "frame_count": len(frames),
    }

    # Simple visual similarity check: compare color histograms
    if len(frames) > 1:
        histograms = [f.histogram() for f in frames]
        similarity_sum = 0

        for i in range(len(histograms) - 1):
            # Compare adjacent frames
            h1, h2 = histograms[i], histograms[i + 1]
            similarity = sum(min(a, b) for a, b in zip(h1, h2)) / sum(h1)
            similarity_sum += similarity

        results["visual_similarity"] = similarity_sum / (len(frames) - 1)
    else:
        results["visual_similarity"] = 1.0

    results["passes"] = (
        results["size_consistent"]
        and results["has_transparency"]
        and results["visual_similarity"] > 0.5  # At least 50% similar
    )

    return results


async def main():
    """Main POC execution"""
    print("=" * 50)
    print("POC: Isometric Sprite Animation Generator")
    print("=" * 50)

    # Initialize ComfyUI client
    comfyui_url = "http://localhost:8188"
    client = ComfyUIClient(comfyui_url)

    print(f"\n[POC] Connecting to ComfyUI at {comfyui_url}...")
    if not await client.is_available():
        print("✗ ComfyUI not available!")
        print("\nPlease start ComfyUI:")
        print("  docker-compose up comfyui")
        return

    print("✓ ComfyUI available")

    # Setup output directory
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    # Generate sprites for all test entities
    results = []
    total_start = time.time()

    for entity in TEST_ENTITIES:
        result = await generate_walk_cycle(client, entity, output_dir)
        results.append(result)

    total_time = time.time() - total_start

    # Print summary
    print("\n" + "=" * 50)
    print("POC Complete!")
    print("=" * 50)

    successful = [r for r in results if not r.get("error")]
    failed = [r for r in results if r.get("error")]

    print(f"\n✓ Successful: {len(successful)}/{len(results)} entities")
    if failed:
        print(f"✗ Failed: {len(failed)} entities")

    if successful:
        total_frames = sum(r["frames"] for r in successful)
        avg_time_per_frame = sum(r["avg_time"] for r in successful) / len(successful)

        print(f"\nTotal frames: {total_frames}")
        print(f"Total time: {total_time:.1f}s")
        print(f"Average: {avg_time_per_frame:.1f}s per frame")

        print("\nValidation Results:")
        for result in successful:
            v = result["validation"]
            status = "✓ PASS" if v["passes"] else "✗ FAIL"
            print(
                f"  {result['entity']}: {status} "
                f"(similarity: {v['visual_similarity']:.0%})"
            )

    print(f"\nOutput directory: {output_dir.absolute()}")
    print("\nNext steps:")
    print("  1. Open viewer.html to see animated sprites")
    print("  2. Review individual frames in output/<entity>/ directories")
    print("  3. Check metadata.json for sprite sheet coordinates")


if __name__ == "__main__":
    asyncio.run(main())
