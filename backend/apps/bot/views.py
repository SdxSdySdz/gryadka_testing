import os
import json
import asyncio

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

import telegram
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup

from apps.users.services import UserService


@csrf_exempt
@require_POST
def webhook(request):
    """Handle incoming Telegram webhook updates."""
    try:
        data = json.loads(request.body)
        bot = telegram.Bot(token=settings.TELEGRAM_BOT_TOKEN)

        # Process update
        update = Update.de_json(data, bot)

        if update.message:
            _handle_message(bot, update)

        return HttpResponse('ok')
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def _handle_message(bot, update):
    """Handle incoming messages."""
    message = update.message
    tg_user = message.from_user

    if not tg_user:
        return

    # Auto-create/update user
    user, created = UserService.update_or_create_from_bot(tg_user)

    text = message.text or ''

    if text == '/start':
        _handle_start(bot, message, user)


def _handle_start(bot, message, user):
    """Handle /start command."""
    domain = os.environ.get('DOMAIN') or (settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost')
    webapp_url = f'https://{domain}'

    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton(
            text='🛒 Открыть магазин',
            web_app=telegram.WebAppInfo(url=webapp_url),
        )]
    ])

    welcome_text = (
        f'Привет, {user.first_name}! 🍎🥬\n\n'
        'Добро пожаловать в магазин «Грядка»!\n'
        'Свежие овощи и фрукты с доставкой.\n\n'
        'Нажмите кнопку ниже, чтобы открыть магазин:'
    )

    asyncio.get_event_loop().run_until_complete(
        bot.send_message(
            chat_id=message.chat_id,
            text=welcome_text,
            reply_markup=keyboard,
        )
    )
