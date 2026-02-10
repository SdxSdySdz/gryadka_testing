from django.db import models


class ShopSettings(models.Model):
    """Singleton model for shop-wide settings."""
    min_order_sum = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        verbose_name='Минимальная сумма заказа',
    )
    free_delivery_threshold = models.DecimalField(
        max_digits=10, decimal_places=2, default=5000,
        verbose_name='Бесплатная доставка от (₽)',
    )
    urgency_surcharge = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        verbose_name='Наценка за срочность (₽)',
    )

    class Meta:
        db_table = 'shop_settings'
        verbose_name = 'Shop Settings'
        verbose_name_plural = 'Shop Settings'

    def save(self, *args, **kwargs):
        # Ensure only one instance
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return 'Shop Settings'


class PaymentMethod(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'payment_methods'
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class DeliveryMethod(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        verbose_name='Стоимость доставки (₽)',
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'delivery_methods'
        ordering = ['sort_order']

    def __str__(self):
        return self.name


class DeliveryDistrict(models.Model):
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'delivery_districts'
        ordering = ['name']

    def __str__(self):
        return self.name


class DeliveryInterval(models.Model):
    label = models.CharField(max_length=100)  # e.g. "9:00 - 15:00"
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'delivery_intervals'
        ordering = ['sort_order']

    def __str__(self):
        return self.label
