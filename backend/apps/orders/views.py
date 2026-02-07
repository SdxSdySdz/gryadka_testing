from decimal import Decimal

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.orders.models import Order, OrderItem
from apps.orders.serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusSerializer,
)
from apps.products.models import Product


@api_view(['GET', 'POST'])
def order_list_create(request):
    """List user's orders or create a new one."""
    if request.method == 'GET':
        orders = Order.objects.filter(user=request.tma_user).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    # Create order
    serializer = OrderCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    order = Order.objects.create(
        user=request.tma_user,
        delivery_method=data.get('delivery_method', ''),
        delivery_district=data.get('delivery_district', ''),
        delivery_interval=data.get('delivery_interval', ''),
        payment_method=data.get('payment_method', ''),
        comment=data.get('comment', ''),
        promo_code=data.get('promo_code', ''),
    )

    total = Decimal('0')
    for item_data in data['items']:
        product_id = item_data.get('product_id')
        quantity = Decimal(str(item_data.get('quantity', 1)))
        price_type = item_data.get('price_type', 'kg')

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            order.delete()
            return Response({'error': f'Product {product_id} not found'}, status=400)

        # Get price based on type
        price_map = {
            'kg': product.price_per_kg,
            'box': product.price_per_box,
            'pack': product.price_per_pack,
            'unit': product.price_per_unit,
        }
        price = price_map.get(price_type)
        if price is None:
            # Fallback to main price
            price = product.main_price

        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            quantity=quantity,
            price_type=price_type,
            price=price,
        )
        total += price * quantity

    order.total = total
    order.save(update_fields=['total'])

    return Response(
        OrderSerializer(order).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def order_detail(request, pk):
    """Get order detail."""
    try:
        order = Order.objects.prefetch_related('items').get(pk=pk, user=request.tma_user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    return Response(OrderSerializer(order).data)


# ─── Admin endpoints ───────────────────────────────────────

@api_view(['GET'])
def admin_order_list(request):
    """Admin: list all orders."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    qs = Order.objects.select_related('user').prefetch_related('items').all()

    # Filter by status
    order_status = request.query_params.get('status')
    if order_status:
        qs = qs.filter(status=order_status)

    serializer = OrderSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
def admin_order_update(request, pk):
    """Admin: update order status."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        order = Order.objects.prefetch_related('items').get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    serializer = OrderStatusSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    order.status = serializer.validated_data['status']
    order.save(update_fields=['status'])

    return Response(OrderSerializer(order).data)
