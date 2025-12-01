try:
    from PIL import Image
except ImportError:
    Image = None

from io import BytesIO
import requests
import os
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Image processing utilities"""

    REMOVE_BG_API_KEY = os.getenv("REMOVEBG_API_KEY", "")
    MAX_FILE_SIZE = 500 * 1024  # 500KB

    @staticmethod
    def remove_background(image_path: str) -> Tuple[bytes | None, bool]:
        """Remove background using remove.bg API (if key set), else return original bytes."""
        try:
            # Read image file or URL
            if image_path.startswith("http"):
                response = requests.get(image_path, timeout=10)
                img_data = response.content
            else:
                with open(image_path, "rb") as f:
                    img_data = f.read()

            # Call remove.bg API only if API key is set
            if ImageProcessor.REMOVE_BG_API_KEY:
                r = requests.post(
                    "https://api.remove.bg/v1.0/removebg",
                    files={"image_file": img_data},
                    data={"size": "preview"},
                    headers={"X-API-Key": ImageProcessor.REMOVE_BG_API_KEY},
                    timeout=30,
                )

                if r.status_code == requests.codes.ok:
                    return r.content, True
                else:
                    logger.warning(f"Remove.bg API error: {r.status_code}")
                    return img_data, False
            else:
                # No API key → just return original image
                logger.warning("REMOVEBG_API_KEY not set, returning original image")
                return img_data, False

        except Exception as e:
            logger.error(f"Background removal error: {str(e)}")
            return None, False

    @staticmethod
    def resize_image(
        image_path: str,
        width: int,
        height: int,
        maintain_aspect: bool = True,
    ) -> bytes | None:
        """Resize image to target dimensions. If Pillow not available, return None."""
        if Image is None:
            logger.warning("Pillow not installed, resize_image is disabled")
            return None

        try:
            img = Image.open(image_path)

            if maintain_aspect:
                img.thumbnail((width, height), Image.Resampling.LANCZOS)
            else:
                img = img.resize((width, height), Image.Resampling.LANCZOS)

            # Convert RGBA to RGB
            if img.mode == "RGBA":
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=95)
            return buffer.getvalue()

        except Exception as e:
            logger.error(f"Resize error: {str(e)}")
            return None

    @staticmethod
    def optimize_image(image_bytes: bytes, max_size_kb: int = 500) -> bytes:
        """Optimize image size. If Pillow not available, return original bytes."""
        if Image is None:
            logger.warning("Pillow not installed, optimize_image returns original bytes")
            return image_bytes

        try:
            img = Image.open(BytesIO(image_bytes))

            # Convert RGBA to RGB
            if img.mode == "RGBA":
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            quality = 95
            min_quality, max_quality = 60, 95

            while min_quality <= max_quality:
                buffer = BytesIO()
                img.save(buffer, format="JPEG", quality=quality, optimize=True)
                size_kb = buffer.tell() / 1024

                if abs(size_kb - max_size_kb) < 10:
                    return buffer.getvalue()
                elif size_kb > max_size_kb:
                    max_quality = quality - 1
                else:
                    min_quality = quality + 1

                quality = (min_quality + max_quality) // 2

            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=quality, optimize=True)
            return buffer.getvalue()

        except Exception as e:
            logger.error(f"Optimization error: {str(e)}")
            return image_bytes

    @staticmethod
    def get_image_metadata(image_path: str) -> dict:
        """Get image metadata. If Pillow not available, return basic info."""
        if Image is None:
            logger.warning("Pillow not installed, get_image_metadata returns basic info")
            return {
                "width": 0,
                "height": 0,
                "format": None,
                "mode": None,
                "size": os.path.getsize(image_path) if os.path.exists(image_path) else 0,
            }

        try:
            img = Image.open(image_path)
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode,
                "size": os.path.getsize(image_path) if os.path.exists(image_path) else 0,
            }
        except Exception as e:
            logger.error(f"Metadata error: {str(e)}")
            return {}
