from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.users.models import User
from apps.users.serializers import UserSerializer, AdminUserSerializer
from apps.users.services import UserService


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
                | Q(telegram_id=tid)
            )
        except ValueError:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
            )

    serializer = UserSerializer(qs[:50], many=True)
    return Response(serializer.data)
