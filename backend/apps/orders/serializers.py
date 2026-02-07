from rest_framework import serializers
from apps.orders.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_type', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_display_name', 'status',
            'delivery_method', 'delivery_district', 'delivery_interval',
            'payment_method', 'comment', 'promo_code',
            'total', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'total', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    delivery_method = serializers.CharField(required=False, default='', allow_blank=True)
    delivery_district = serializers.CharField(required=False, default='', allow_blank=True)
    delivery_interval = serializers.CharField(required=False, default='', allow_blank=True)
    payment_method = serializers.CharField(required=False, default='', allow_blank=True)
    comment = serializers.CharField(required=False, default='', allow_blank=True)
    promo_code = serializers.CharField(required=False, default='', allow_blank=True)
    items = serializers.ListField(child=serializers.DictField(), min_length=1)


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
