"""
Simple sprite sheet packer using PIL.
Packs animation frames into a grid layout with metadata.
"""

import json
from typing import List, Tuple
from PIL import Image


class SpriteSheetPacker:
    """Pack multiple sprite frames into a single sprite sheet"""

    def pack(
        self, frames: List[Image.Image], entity_name: str, animation_name: str = "walk"
    ) -> Tuple[Image.Image, dict]:
        """
        Pack frames into a grid sprite sheet

        Args:
            frames: List of PIL Images to pack
            entity_name: Name of the entity (e.g., "goblin")
            animation_name: Name of the animation (e.g., "walk")

        Returns:
            Tuple of (sprite_sheet_image, metadata_dict)
        """
        if not frames:
            raise ValueError("Cannot pack empty frame list")

        # Get sprite size from first frame
        sprite_width, sprite_height = frames[0].size

        # Calculate grid dimensions (2x2 for 4 frames, etc.)
        num_frames = len(frames)
        cols = 2 if num_frames > 1 else 1
        rows = (num_frames + cols - 1) // cols  # Ceiling division

        # Create sprite sheet canvas
        sheet_width = sprite_width * cols
        sheet_height = sprite_height * rows
        sprite_sheet = Image.new("RGBA", (sheet_width, sheet_height), (0, 0, 0, 0))

        # Pack frames and build metadata
        frame_metadata = []

        for i, frame in enumerate(frames):
            # Ensure frame is correct size
            if frame.size != (sprite_width, sprite_height):
                frame = frame.resize((sprite_width, sprite_height), Image.Resampling.LANCZOS)

            # Calculate position in grid
            col = i % cols
            row = i // cols
            x = col * sprite_width
            y = row * sprite_height

            # Paste frame into sheet
            sprite_sheet.paste(frame, (x, y))

            # Add metadata for this frame
            frame_metadata.append({
                "x": x,
                "y": y,
                "w": sprite_width,
                "h": sprite_height,
                "duration": 150,  # milliseconds per frame
            })

        # Build complete metadata
        metadata = {
            "animations": {animation_name: {"frames": frame_metadata}},
            "entityType": entity_name,
            "spriteSize": {"w": sprite_width, "h": sprite_height},
            "totalFrames": num_frames,
        }

        return sprite_sheet, metadata

    @staticmethod
    def normalize_sprite(
        image: Image.Image, target_size: Tuple[int, int] = (32, 32)
    ) -> Image.Image:
        """
        Normalize sprite to target size with centering

        Args:
            image: Source image
            target_size: Target dimensions (width, height)

        Returns:
            Normalized sprite image
        """
        # Resize if needed
        if image.size != target_size:
            # Calculate scaling to fit within target while maintaining aspect ratio
            img_width, img_height = image.size
            target_width, target_height = target_size

            scale = min(target_width / img_width, target_height / img_height)
            new_width = int(img_width * scale)
            new_height = int(img_height * scale)

            # Resize with high-quality resampling
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Create centered canvas
        canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))

        # Calculate centering offset
        offset_x = (target_size[0] - image.size[0]) // 2
        offset_y = (target_size[1] - image.size[1]) // 2

        # Paste sprite centered
        canvas.paste(image, (offset_x, offset_y), image if image.mode == "RGBA" else None)

        return canvas

    @staticmethod
    def save_sprite_sheet(
        sprite_sheet: Image.Image, metadata: dict, output_path: str, entity_name: str
    ):
        """
        Save sprite sheet and metadata to disk

        Args:
            sprite_sheet: Sprite sheet image
            metadata: Frame metadata dictionary
            output_path: Base output directory path
            entity_name: Entity name for filenames
        """
        from pathlib import Path

        output_dir = Path(output_path) / entity_name
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save sprite sheet
        sheet_path = output_dir / "spritesheet.png"
        sprite_sheet.save(sheet_path, "PNG")

        # Save metadata
        metadata_path = output_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        return sheet_path, metadata_path
