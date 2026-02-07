from django.conf import settings
from apps.users.models import User


class UserService:
    @staticmethod
    def update_or_create_from_init_data(tg_user_data: dict) -> User:
        """Create or update user from Telegram Init Data user object."""
        telegram_id = tg_user_data.get('id')
        defaults = {
            'first_name': tg_user_data.get('first_name', ''),
            'last_name': tg_user_data.get('last_name', ''),
            'username': tg_user_data.get('username', ''),
            'photo_url': tg_user_data.get('photo_url', ''),
        }

        user, created = User.objects.update_or_create(
            telegram_id=telegram_id,
            defaults=defaults,
        )

        # Auto-assign admin if telegram_id is in TELEGRAM_ADMIN_IDS
        if created and telegram_id in settings.TELEGRAM_ADMIN_IDS:
            user.is_admin = True
            user.save(update_fields=['is_admin'])

        return user

    @staticmethod
    def update_or_create_from_bot(tg_user) -> tuple:
        """Create or update user from python-telegram-bot User object."""
        defaults = {
            'first_name': tg_user.first_name or '',
            'last_name': tg_user.last_name or '',
            'username': tg_user.username or '',
        }

        user, created = User.objects.update_or_create(
            telegram_id=tg_user.id,
            defaults=defaults,
        )

        if created and tg_user.id in settings.TELEGRAM_ADMIN_IDS:
            user.is_admin = True
            user.save(update_fields=['is_admin'])

        return user, created

    @staticmethod
    def get_or_create_dev_user(telegram_id: int) -> User:
        """Get or create a user for dev/debug purposes."""
        user, created = User.objects.get_or_create(
            telegram_id=telegram_id,
            defaults={
                'first_name': f'Dev User {telegram_id}',
                'is_admin': telegram_id in settings.TELEGRAM_ADMIN_IDS,
            }
        )
        return user

    @staticmethod
    def set_admin(telegram_id: int, is_admin: bool) -> User | None:
        """Set admin status for user."""
        try:
            user = User.objects.get(telegram_id=telegram_id)
            user.is_admin = is_admin
            user.save(update_fields=['is_admin'])
            return user
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_admins():
        return User.objects.filter(is_admin=True)
