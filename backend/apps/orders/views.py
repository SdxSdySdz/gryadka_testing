import asyncio
import logging
from decimal import Decimal

from django.conf import settings as django_settings
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
from apps.users.models import User

logger = logging.getLogger(__name__)

PRICE_TYPE_LABELS = {
    'kg': 'кг', 'gram': 'г', 'box': 'ящ', 'pack': 'уп', 'unit': 'шт',
}


def _notify_admins_new_order(order):
    """Send Telegram notification to admins about a new order with inline button."""
    try:
        import telegram
        bot = telegram.Bot(token=django_settings.TELEGRAM_BOT_TOKEN)
        admins = User.objects.filter(is_admin=True)

        # Build items list
        items_lines = []
        for item in order.items.all():
            unit = PRICE_TYPE_LABELS.get(item.price_type, '')
            qty_str = f"{item.quantity:.0f}" if item.quantity == int(item.quantity) else f"{item.quantity}"
            items_lines.append(f"  • {item.product_name} — {qty_str} {unit} × {item.price:.0f} ₽")

        items_text = '\n'.join(items_lines) if items_lines else '  (нет товаров)'

        text = (
            f"🛒 Новый заказ #{order.id}\n\n"
            f"👤 {order.user.display_name}\n"
            f"💰 Сумма: {order.total:.0f} ₽\n"
            f"🚚 {order.delivery_method or '—'}\n"
            f"💳 {order.payment_method or '—'}\n\n"
            f"Товары:\n{items_text}"
        )
        if order.comment:
            text += f"\n\n💬 {order.comment}"

        domain = django_settings.ALLOWED_HOSTS[0] if django_settings.ALLOWED_HOSTS else 'localhost'
        webapp_url = f'https://{domain}'

        keyboard = telegram.InlineKeyboardMarkup([
            [telegram.InlineKeyboardButton(
                text='📦 Открыть магазин',
                web_app=telegram.WebAppInfo(url=webapp_url),
            )]
        ])

        for admin in admins:
            try:
                asyncio.get_event_loop().run_until_complete(
                    bot.send_message(
                        chat_id=admin.telegram_id,
                        text=text,
                        reply_markup=keyboard,
                    )
                )
            except Exception as e:
                logger.warning(f'Failed to notify admin {admin.telegram_id}: {e}')
    except Exception as e:
        logger.warning(f'Failed to send order notification: {e}')


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
        if price_type == 'gram':
            # For gram type, calculate price from price_per_100g * selected_grams / 100
            selected_grams = item_data.get('selected_grams', 0)
            if product.price_per_100g and selected_grams:
                price = product.price_per_100g * Decimal(str(selected_grams)) / Decimal('100')
            else:
                price = product.main_price
            product_name = f"{product.name} ({selected_grams}г)"
        else:
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
            product_name = product.name

        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product_name,
            quantity=quantity,
            price_type=price_type,
            price=price,
        )
        total += price * quantity

    order.total = total
    order.save(update_fields=['total'])

    # Notify admins via Telegram
    _notify_admins_new_order(order)

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
