import os
import asyncio
import logging

from django.conf import settings as django_settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.users.models import User
from apps.users.serializers import UserSerializer, AdminUserSerializer
from apps.users.services import UserService

logger = logging.getLogger(__name__)


@api_view(['GET', 'PATCH'])
def me(request):
    """Get or update current user profile."""
    user = request.tma_user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    serializer = UserSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET'])
def admin_list(request):
    """List all admins. Admin only."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)
    admins = UserService.get_admins()
    serializer = UserSerializer(admins, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def admin_add(request):
    """Add an admin by telegram_id. Admin only."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    serializer = AdminUserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = UserService.set_admin(
        serializer.validated_data['telegram_id'],
        serializer.validated_data.get('is_admin', True),
    )
    if user is None:
        return Response(
            {'error': 'User not found. They must open the app first.'},
            status=404,
        )
    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
def admin_remove(request, telegram_id):
    """Remove admin by telegram_id. Admin only."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    user = UserService.set_admin(telegram_id, False)
    if user is None:
        return Response({'error': 'User not found'}, status=404)
    return Response(UserSerializer(user).data)


@api_view(['GET'])
def admin_client_search(request):
    """Search clients by name, username or telegram_id. Admin only."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    search = request.query_params.get('search', '').strip()
    qs = User.objects.all().order_by('-created_at')

    if search:
        from django.db.models import Q
        # Try to parse as integer for telegram_id search
        try:
            tid = int(search)
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(phone__icontains=search)
                | Q(telegram_id=tid)
            )
        except ValueError:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(phone__icontains=search)
            )

    serializer = UserSerializer(qs[:50], many=True)
    return Response(serializer.data)


@api_view(['POST'])
def admin_broadcast(request):
    """Send a message to selected users via Telegram bot. Admin only."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    user_ids = request.data.get('user_ids', [])
    text = request.data.get('text', '').strip()

    if not user_ids:
        return Response({'error': 'user_ids is required'}, status=400)
    if not text:
        return Response({'error': 'text is required'}, status=400)

    users = User.objects.filter(id__in=user_ids)
    sent = 0
    failed = 0

    try:
        import telegram
        bot = telegram.Bot(token=django_settings.TELEGRAM_BOT_TOKEN)

        domain = os.environ.get('DOMAIN') or (
            django_settings.ALLOWED_HOSTS[0] if django_settings.ALLOWED_HOSTS else 'localhost'
        )
        webapp_url = f'https://{domain}?v=2'
        keyboard = telegram.InlineKeyboardMarkup([
            [telegram.InlineKeyboardButton(
                text='\U0001f6d2 Открыть магазин',
                web_app=telegram.WebAppInfo(url=webapp_url),
            )]
        ])

        for user in users:
            try:
                asyncio.get_event_loop().run_until_complete(
                    bot.send_message(
                        chat_id=user.telegram_id,
                        text=text,
                        reply_markup=keyboard,
                    )
                )
                sent += 1
            except Exception as e:
                logger.warning(f'Failed to send broadcast to {user.telegram_id}: {e}')
                failed += 1
    except Exception as e:
        logger.error(f'Broadcast error: {e}')
        return Response({'error': str(e)}, status=500)

    return Response({'sent': sent, 'failed': failed})
