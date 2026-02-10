from rest_framework import serializers
from apps.settings_app.models import (
    ShopSettings,
    PaymentMethod,
    DeliveryMethod,
    DeliveryDistrict,
    DeliveryInterval,
)


class ShopSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopSettings
        fields = ['min_order_sum', 'free_delivery_threshold', 'urgency_surcharge']


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'is_active', 'sort_order']


class DeliveryMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryMethod
        fields = ['id', 'name', 'price', 'is_active', 'sort_order']


class DeliveryDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryDistrict
        fields = ['id', 'name']


class DeliveryIntervalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryInterval
        fields = ['id', 'label', 'sort_order']


class AllSettingsSerializer(serializers.Serializer):
    """Combined serializer for public settings endpoint."""
    min_order_sum = serializers.DecimalField(max_digits=10, decimal_places=2)
    free_delivery_threshold = serializers.DecimalField(max_digits=10, decimal_places=2)
    urgency_surcharge = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_methods = PaymentMethodSerializer(many=True)
    delivery_methods = DeliveryMethodSerializer(many=True)
    delivery_districts = DeliveryDistrictSerializer(many=True)
    delivery_intervals = DeliveryIntervalSerializer(many=True)
