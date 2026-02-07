from django.db import models


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

    # Old price for sales display
    old_price = models.DecimalField(
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
        """Return the first available price."""
        for price in [self.price_per_kg, self.price_per_unit,
                      self.price_per_pack, self.price_per_box]:
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

    def __str__(self):
        return f'Image for {self.product.name}'
