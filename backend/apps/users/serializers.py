from rest_framework import serializers
from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'telegram_id', 'first_name', 'last_name',
            'username', 'photo_url', 'is_admin', 'display_name',
            'created_at',
        ]
        read_only_fields = ['id', 'telegram_id', 'is_admin', 'created_at']


class AdminUserSerializer(serializers.Serializer):
    telegram_id = serializers.IntegerField()
    is_admin = serializers.BooleanField(default=True)
