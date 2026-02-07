import asyncio
from datetime import datetime

from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.chat.models import ChatRoom, Message
from apps.chat.serializers import ChatRoomSerializer, MessageSerializer
from apps.users.models import User


def _notify_admins_new_message(client_user, text):
    """Send Telegram notification to all admins about a new chat message."""
    try:
        import telegram
        bot = telegram.Bot(token=settings.TELEGRAM_BOT_TOKEN)
        admins = User.objects.filter(is_admin=True)
        message_text = (
            f"💬 Новое сообщение от {client_user.display_name}:\n\n"
            f"{text[:200]}"
        )
        for admin in admins:
            try:
                asyncio.get_event_loop().run_until_complete(
                    bot.send_message(chat_id=admin.telegram_id, text=message_text)
                )
            except Exception:
                pass
    except Exception:
        pass


# ─── Client endpoints ──────────────────────────────────────

@api_view(['GET'])
def client_messages(request):
    """Client: get own chat messages. Supports polling with ?after=timestamp."""
    room, _ = ChatRoom.objects.get_or_create(client=request.tma_user)

    qs = room.messages.all()

    after = request.query_params.get('after')
    if after:
        try:
            after_dt = datetime.fromisoformat(after)
            qs = qs.filter(created_at__gt=after_dt)
        except (ValueError, TypeError):
            pass

    serializer = MessageSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def client_send_message(request):
    """Client: send a message to support."""
    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Text required'}, status=400)

    room, _ = ChatRoom.objects.get_or_create(client=request.tma_user)

    message = Message.objects.create(
        room=room,
        sender=request.tma_user,
        text=text,
    )
    room.save()  # update updated_at

    # Notify admins
    _notify_admins_new_message(request.tma_user, text)

    return Response(MessageSerializer(message).data, status=201)


# ─── Admin endpoints ───────────────────────────────────────

@api_view(['GET'])
def admin_chat_rooms(request):
    """Admin: list all chat rooms."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    rooms = ChatRoom.objects.select_related('client').prefetch_related('messages').all()
    serializer = ChatRoomSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def admin_room_messages(request, room_id):
    """Admin: get messages in a specific chat room."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        room = ChatRoom.objects.get(pk=room_id)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

    qs = room.messages.all()

    after = request.query_params.get('after')
    if after:
        try:
            after_dt = datetime.fromisoformat(after)
            qs = qs.filter(created_at__gt=after_dt)
        except (ValueError, TypeError):
            pass

    # Mark client messages as read
    room.messages.filter(sender=room.client, is_read=False).update(is_read=True)

    serializer = MessageSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def admin_send_message(request, room_id):
    """Admin: send a message in a chat room."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        room = ChatRoom.objects.get(pk=room_id)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Room not found'}, status=404)

    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Text required'}, status=400)

    message = Message.objects.create(
        room=room,
        sender=request.tma_user,
        text=text,
    )
    room.save()  # update updated_at

    return Response(MessageSerializer(message).data, status=201)
