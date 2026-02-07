from django.db import models
from apps.users.models import User
from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('confirmed', 'Подтвержден'),
        ('preparing', 'Собирается'),
        ('delivering', 'Доставляется'),
        ('completed', 'Завершен'),
        ('cancelled', 'Отменен'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')

    delivery_method = models.CharField(max_length=100, blank=True, default='')
    delivery_district = models.CharField(max_length=255, blank=True, default='')
    delivery_interval = models.CharField(max_length=100, blank=True, default='')
    payment_method = models.CharField(max_length=100, blank=True, default='')

    comment = models.TextField(blank=True, default='')
    promo_code = models.CharField(max_length=100, blank=True, default='')

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} by {self.user}'


class OrderItem(models.Model):
    PRICE_TYPE_CHOICES = [
        ('kg', 'за кг'),
        ('gram', 'за граммовку'),
        ('box', 'за ящик'),
        ('pack', 'за упаковку'),
        ('unit', 'за штуку'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  # snapshot in case product deleted
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    price_type = models.CharField(max_length=10, choices=PRICE_TYPE_CHOICES, default='kg')
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
