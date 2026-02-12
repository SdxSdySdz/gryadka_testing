"""
Management command to compress all existing product and category images.
Run once after deploying image compression feature.
"""
import os
from io import BytesIO

from PIL import Image as PILImage
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.products.models import Category, ProductImage

MAX_DIMENSION = 1200
JPEG_QUALITY = 82


def compress_existing_file(image_field):
    """Compress an existing image file on disk. Returns True if compressed."""
    if not image_field or not image_field.name:
        return False

    try:
        image_field.open('rb')
        img = PILImage.open(image_field)
    except Exception as e:
        print(f'  Could not open: {e}')
        return False

    original_size = image_field.size

    # Convert to RGB
    if img.mode in ('RGBA', 'P', 'LA'):
        bg = PILImage.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        bg.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
        img = bg
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize if needed
    w, h = img.size
    if max(w, h) > MAX_DIMENSION:
        if w > h:
            new_w = MAX_DIMENSION
            new_h = int(h * MAX_DIMENSION / w)
        else:
            new_h = MAX_DIMENSION
            new_w = int(w * MAX_DIMENSION / h)
        img = img.resize((new_w, new_h), PILImage.LANCZOS)

    # Save to buffer
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=JPEG_QUALITY, optimize=True)
    new_size = buffer.tell()
    buffer.seek(0)

    # Only replace if actually smaller
    if new_size >= original_size:
        image_field.close()
        return False

    # Build new filename (basename only — Django's upload_to adds directory)
    old_name = image_field.name
    basename = os.path.basename(old_name)
    name_without_ext = basename.rsplit('.', 1)[0] if '.' in basename else basename
    new_name = f'{name_without_ext}.jpg'

    # Delete old file and save new
    old_path = image_field.path
    image_field.save(new_name, ContentFile(buffer.read()), save=False)

    # Remove old file if different from new
    if os.path.exists(old_path) and os.path.abspath(old_path) != os.path.abspath(image_field.path):
        try:
            os.remove(old_path)
        except OSError:
            pass

    return True


class Command(BaseCommand):
    help = 'Compress all existing product and category images'

    def handle(self, *args, **options):
        # Compress product images
        product_images = ProductImage.objects.all()
        compressed = 0
        total = product_images.count()
        self.stdout.write(f'Processing {total} product images...')

        for pi in product_images:
            self.stdout.write(f'  [{pi.id}] {pi.image.name}', ending='')
            if compress_existing_file(pi.image):
                pi.save(update_fields=['image'])
                self.stdout.write(' -> compressed')
                compressed += 1
            else:
                self.stdout.write(' -> skipped')

        self.stdout.write(self.style.SUCCESS(
            f'Product images: {compressed}/{total} compressed'
        ))

        # Compress category images
        categories = Category.objects.exclude(image='').exclude(image__isnull=True)
        compressed = 0
        total = categories.count()
        self.stdout.write(f'Processing {total} category images...')

        for cat in categories:
            self.stdout.write(f'  [{cat.id}] {cat.image.name}', ending='')
            if compress_existing_file(cat.image):
                cat.save(update_fields=['image'])
                self.stdout.write(' -> compressed')
                compressed += 1
            else:
                self.stdout.write(' -> skipped')

        self.stdout.write(self.style.SUCCESS(
            f'Category images: {compressed}/{total} compressed'
        ))

        self.stdout.write(self.style.SUCCESS('Done!'))
