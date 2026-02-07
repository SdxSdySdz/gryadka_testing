from django.contrib import admin
from apps.settings_app.models import (
    ShopSettings,
    PaymentMethod,
    DeliveryMethod,
    DeliveryDistrict,
    DeliveryInterval,
)


@admin.register(ShopSettings)
class ShopSettingsAdmin(admin.ModelAdmin):
    list_display = ['min_order_sum']


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'sort_order']


@admin.register(DeliveryMethod)
class DeliveryMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'sort_order']


@admin.register(DeliveryDistrict)
class DeliveryDistrictAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(DeliveryInterval)
class DeliveryIntervalAdmin(admin.ModelAdmin):
    list_display = ['label', 'sort_order']
