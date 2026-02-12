"""
Image compression utility.
Resizes and compresses uploaded images to reduce file size for mobile clients.
"""
import io
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile


MAX_DIMENSION = 1200  # max width or height in pixels
JPEG_QUALITY = 82     # JPEG quality (1-100)


def compress_image(image_field) -> InMemoryUploadedFile | None:
    """
    Compress an ImageField value before saving.
    - Resizes so the longest side is at most MAX_DIMENSION px
    - Converts to JPEG at JPEG_QUALITY
    - Returns a new InMemoryUploadedFile, or None if no image.
    """
    if not image_field:
        return None

    try:
        img = Image.open(image_field)
    except Exception:
        return image_field  # can't process — return as-is

    # Convert RGBA/P to RGB for JPEG
    if img.mode in ('RGBA', 'P', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize if too large
    w, h = img.size
    if max(w, h) > MAX_DIMENSION:
        if w > h:
            new_w = MAX_DIMENSION
            new_h = int(h * MAX_DIMENSION / w)
        else:
            new_h = MAX_DIMENSION
            new_w = int(w * MAX_DIMENSION / h)
        img = img.resize((new_w, new_h), Image.LANCZOS)

    # Save to buffer as JPEG
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=JPEG_QUALITY, optimize=True)
    buffer.seek(0)

    # Build new filename with .jpg extension
    original_name = getattr(image_field, 'name', 'image.jpg')
    name_without_ext = original_name.rsplit('.', 1)[0] if '.' in original_name else original_name
    new_name = f'{name_without_ext}.jpg'

    return InMemoryUploadedFile(
        file=buffer,
        field_name='image',
        name=new_name,
        content_type='image/jpeg',
        size=buffer.getbuffer().nbytes,
        charset=None,
    )
