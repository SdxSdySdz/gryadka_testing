from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.settings_app.models import (
    ShopSettings,
    PaymentMethod,
    DeliveryMethod,
    DeliveryDistrict,
    DeliveryInterval,
)
from apps.settings_app.serializers import (
    ShopSettingsSerializer,
    PaymentMethodSerializer,
    DeliveryMethodSerializer,
    DeliveryDistrictSerializer,
    DeliveryIntervalSerializer,
)


@api_view(['GET'])
def public_settings(request):
    """Public: get all shop settings for the client."""
    settings_obj = ShopSettings.load()
    return Response({
        'min_order_sum': str(settings_obj.min_order_sum),
        'payment_methods': PaymentMethodSerializer(
            PaymentMethod.objects.filter(is_active=True), many=True
        ).data,
        'delivery_methods': DeliveryMethodSerializer(
            DeliveryMethod.objects.filter(is_active=True), many=True
        ).data,
        'delivery_districts': DeliveryDistrictSerializer(
            DeliveryDistrict.objects.all(), many=True
        ).data,
        'delivery_intervals': DeliveryIntervalSerializer(
            DeliveryInterval.objects.all(), many=True
        ).data,
    })


# ─── Admin endpoints ───────────────────────────────────────

@api_view(['GET', 'PATCH'])
def admin_shop_settings(request):
    """Admin: get or update shop settings."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    obj = ShopSettings.load()
    if request.method == 'GET':
        return Response(ShopSettingsSerializer(obj).data)

    serializer = ShopSettingsSerializer(obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def admin_payment_methods(request):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    if request.method == 'GET':
        qs = PaymentMethod.objects.all()
        return Response(PaymentMethodSerializer(qs, many=True).data)
    s = PaymentMethodSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=201)


@api_view(['PATCH', 'DELETE'])
def admin_payment_method_detail(request, pk):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    try:
        obj = PaymentMethod.objects.get(pk=pk)
    except PaymentMethod.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)
    s = PaymentMethodSerializer(obj, data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)


@api_view(['GET', 'POST'])
def admin_delivery_methods(request):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    if request.method == 'GET':
        qs = DeliveryMethod.objects.all()
        return Response(DeliveryMethodSerializer(qs, many=True).data)
    s = DeliveryMethodSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=201)


@api_view(['PATCH', 'DELETE'])
def admin_delivery_method_detail(request, pk):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    try:
        obj = DeliveryMethod.objects.get(pk=pk)
    except DeliveryMethod.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)
    s = DeliveryMethodSerializer(obj, data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)


@api_view(['GET', 'POST'])
def admin_delivery_districts(request):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    if request.method == 'GET':
        qs = DeliveryDistrict.objects.all()
        return Response(DeliveryDistrictSerializer(qs, many=True).data)
    s = DeliveryDistrictSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=201)


@api_view(['PATCH', 'DELETE'])
def admin_delivery_district_detail(request, pk):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    try:
        obj = DeliveryDistrict.objects.get(pk=pk)
    except DeliveryDistrict.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)
    s = DeliveryDistrictSerializer(obj, data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)


@api_view(['GET', 'POST'])
def admin_delivery_intervals(request):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    if request.method == 'GET':
        qs = DeliveryInterval.objects.all()
        return Response(DeliveryIntervalSerializer(qs, many=True).data)
    s = DeliveryIntervalSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data, status=201)


@api_view(['PATCH', 'DELETE'])
def admin_delivery_interval_detail(request, pk):
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    try:
        obj = DeliveryInterval.objects.get(pk=pk)
    except DeliveryInterval.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    if request.method == 'DELETE':
        obj.delete()
        return Response(status=204)
    s = DeliveryIntervalSerializer(obj, data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    s.save()
    return Response(s.data)
