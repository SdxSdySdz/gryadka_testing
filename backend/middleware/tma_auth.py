import hashlib
import hmac
import json
import time
from urllib.parse import parse_qs, unquote

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse


class TMAAuthorizationMiddleware:
    """
    Validates Telegram Mini App Init Data on every request.
    Follows the algorithm from Telegram documentation:
    1. Extract parameters from init data string
    2. Exclude hash
    3. Sort alphabetically, join as key=value with newlines
    4. Compute HMAC-SHA256 with secret key
    5. Compare with received hash
    6. Check auth_date freshness
    """

    # Paths that don't require authentication
    EXEMPT_PATHS = [
        '/api/bot/webhook/',
    ]

    # Init data is valid for 24 hours
    MAX_AUTH_AGE = 86400

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # Skip exempt paths
        if any(request.path.startswith(p) for p in self.EXEMPT_PATHS):
            return self.get_response(request)

        # Skip if already authenticated (e.g., by DevAuthMiddleware)
        if hasattr(request, 'tma_user') and request.tma_user is not None:
            return self.get_response(request)

        auth_cred = request.headers.get('Authorization', '')
        if not auth_cred:
            return JsonResponse({'error': 'Authorization header required'}, status=401)

        # Validate init data
        user_data = self._validate_init_data(auth_cred)
        if user_data is None:
            return JsonResponse({'error': 'Invalid init data'}, status=401)

        # Store parsed user data on request for views to use
        request.tma_user_data = user_data

        # Auto-create or update user
        from apps.users.services import UserService
        user = UserService.update_or_create_from_init_data(user_data)
        request.tma_user = user

        return self.get_response(request)

    def _validate_init_data(self, init_data_raw: str) -> dict | None:
        """Validate init data and return user dict or None."""
        try:
            parsed = parse_qs(init_data_raw, keep_blank_values=True)

            # Each value in parse_qs is a list, take first element
            params = {k: v[0] for k, v in parsed.items()}

            received_hash = params.pop('hash', None)
            if not received_hash:
                return None

            # Check auth_date
            auth_date = params.get('auth_date')
            if auth_date:
                auth_timestamp = int(auth_date)
                if time.time() - auth_timestamp > self.MAX_AUTH_AGE:
                    return None

            # Sort and create data check string
            data_check_pairs = sorted(params.items())
            data_check_string = '\n'.join(f'{k}={v}' for k, v in data_check_pairs)

            # Compute HMAC-SHA256
            computed_hash = hmac.new(
                settings.TELEGRAM_SECRET_KEY,
                data_check_string.encode('utf-8'),
                hashlib.sha256,
            ).hexdigest()

            if not hmac.compare_digest(computed_hash, received_hash):
                return None

            # Parse user data
            user_str = params.get('user')
            if not user_str:
                return None

            user_data = json.loads(unquote(user_str))
            return user_data

        except (ValueError, KeyError, json.JSONDecodeError):
            return None
