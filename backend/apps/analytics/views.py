from datetime import date, timedelta, datetime

from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.orders.models import Order


def _get_analytics(start_date, end_date):
    """Get order analytics for a date range."""
    qs = Order.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
    ).exclude(status='cancelled')

    agg = qs.aggregate(
        total_orders=Count('id'),
        total_revenue=Sum('total'),
    )

    return {
        'total_orders': agg['total_orders'] or 0,
        'total_revenue': str(agg['total_revenue'] or 0),
        'start_date': str(start_date),
        'end_date': str(end_date),
    }


@api_view(['GET'])
def analytics(request):
    """Admin: get sales analytics.

    Query params:
        period: today | yesterday | month
        date: YYYY-MM-DD (specific day)
    """
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    today = timezone.localdate()
    period = request.query_params.get('period', 'today')
    specific_date = request.query_params.get('date')

    if specific_date:
        try:
            day = datetime.strptime(specific_date, '%Y-%m-%d').date()
            data = _get_analytics(day, day)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=400)
    elif period == 'yesterday':
        yesterday = today - timedelta(days=1)
        data = _get_analytics(yesterday, yesterday)
    elif period == 'month':
        first_day = today.replace(day=1)
        data = _get_analytics(first_day, today)
    else:  # today
        data = _get_analytics(today, today)

    return Response(data)
