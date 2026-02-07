from django.conf import settings
from django.http import HttpRequest, HttpResponse


class DevAuthMiddleware:
    """
    Development-only middleware that allows bypassing TMA auth
    by passing X-Dev-User-ID header. Only active when DEBUG=True.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        request.tma_user = None
        request.tma_user_data = None

        if not settings.DEBUG:
            return self.get_response(request)

        dev_user_id = request.headers.get('X-Dev-User-ID')
        if not dev_user_id:
            return self.get_response(request)

        try:
            from apps.users.services import UserService
            user = UserService.get_or_create_dev_user(int(dev_user_id))
            request.tma_user = user
            request.tma_user_data = {
                'id': user.telegram_id,
                'first_name': user.first_name,
                'last_name': user.last_name or '',
                'username': user.username or '',
            }
        except (ValueError, TypeError):
            pass

        return self.get_response(request)
