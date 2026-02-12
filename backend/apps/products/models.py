from django.db import models
from utils.images import compress_image


class Category(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'categories'

    def save(self, *args, **kwargs):
        if self.image and hasattr(self.image, 'file'):
            compressed = compress_image(self.image)
            if compressed:
                self.image = compressed
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    TAG_CHOICES = [
        ('hit', 'Хит'),
        ('sale', 'Акция'),
        ('recommended', 'Советую'),
    ]

    name = models.CharField(max_length=255)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE,
        related_name='products',
    )
    description = models.TextField(blank=True, default='')

    # Prices for different units
    price_per_kg = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    price_per_box = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    price_per_pack = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    price_per_unit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    price_per_100g = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Цена за 100 грамм',
    )

    # Weight info for boxes and packs (in grams)
    box_weight = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Вес коробки в граммах',
    )
    pack_weight = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Вес упаковки в граммах',
    )

    # Available gram portions (comma-separated, e.g. "250,300,500")
    available_grams = models.CharField(
        max_length=255, blank=True, default='',
        help_text='Доступные граммовки через запятую (напр. 250,300,500)',
    )

    # Old prices for sales display (per price type)
    old_price_per_kg = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    old_price_per_box = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    old_price_per_pack = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    old_price_per_unit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )
    old_price_per_100g = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
    )

    tag = models.CharField(
        max_length=20, choices=TAG_CHOICES,
        blank=True, default='',
    )
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def main_price(self):
        """Return the first available price by priority: kg > 100g > unit > pack > box."""
        for price in [self.price_per_kg, self.price_per_100g,
                      self.price_per_unit, self.price_per_pack,
                      self.price_per_box]:
            if price is not None:
                return price
        return 0

    @property
    def main_image(self):
        """Return first image URL or None."""
        img = self.images.first()
        return img.image.url if img else None


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='products/')
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'product_images'
        ordering = ['sort_order']

    def save(self, *args, **kwargs):
        if self.image and hasattr(self.image, 'file'):
            compressed = compress_image(self.image)
            if compressed:
                self.image = compressed
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Image for {self.product.name}'
