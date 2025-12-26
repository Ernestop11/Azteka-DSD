#!/usr/bin/env python3
"""
Background Removal Script using rembg
Simple, clean background removal for product photos.

Usage:
  python3 remove-bg.py <input_path> <output_path>
"""

import sys
from pathlib import Path
from PIL import Image
from rembg import remove

def remove_background(input_path: str, output_path: str):
    """
    Remove background using default rembg model (u2net)
    Simple and effective for most product photos.
    """
    # Read input image
    input_image = Image.open(input_path)

    # Use default rembg settings - simple and effective
    output_image = remove(input_image)

    # Ensure RGBA mode for transparency
    if output_image.mode != 'RGBA':
        output_image = output_image.convert('RGBA')

    # Resize to 800x800 max while maintaining aspect ratio
    output_image.thumbnail((800, 800), Image.Resampling.LANCZOS)

    # Save as PNG with transparency
    output_image.save(output_path, 'PNG', optimize=True)

    print(f"Success: {output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 remove-bg.py <input_path> <output_path>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    if not Path(input_path).exists():
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    try:
        remove_background(input_path, output_path)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
