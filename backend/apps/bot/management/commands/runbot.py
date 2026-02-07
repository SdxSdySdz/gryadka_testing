import asyncio
from django.core.management.base import BaseCommand
from django.conf import settings
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

from apps.users.services import UserService


class Command(BaseCommand):
    help = 'Run Telegram bot in polling mode (for local development)'

    def handle(self, *args, **options):
        self.stdout.write('Starting bot in polling mode...')
        self.stdout.write(f'Bot token: {settings.TELEGRAM_BOT_TOKEN[:10]}...')

        app = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()

        app.add_handler(CommandHandler('start', self.start_command))
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))

        self.stdout.write(self.style.SUCCESS('Bot is running! Press Ctrl+C to stop.'))
        app.run_polling(drop_pending_updates=True)

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        tg_user = update.effective_user
        if not tg_user:
            return

        # Auto-create user
        user, created = UserService.update_or_create_from_bot(tg_user)

        domain = settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost'
        # For local dev, use ngrok/localtunnel URL if available
        webapp_url = f'https://{domain}'

        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton(
                text='\U0001f6d2 Открыть магазин',
                web_app=WebAppInfo(url=webapp_url),
            )]
        ])

        welcome_text = (
            f'Привет, {user.first_name}! \U0001f34e\U0001f96c\n\n'
            'Добро пожаловать в магазин «Грядка»!\n'
            'Свежие овощи и фрукты с доставкой.\n\n'
            'Нажмите кнопку ниже, чтобы открыть магазин:'
        )

        await update.message.reply_text(welcome_text, reply_markup=keyboard)

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        tg_user = update.effective_user
        if not tg_user:
            return

        # Auto-create user
        UserService.update_or_create_from_bot(tg_user)

        await update.message.reply_text(
            'Используйте кнопку ниже или команду /start, чтобы открыть магазин.'
        )
