from django.contrib import admin
from apps.users.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['telegram_id', 'first_name', 'last_name', 'username', 'is_admin', 'created_at']
    list_filter = ['is_admin', 'is_active']
    search_fields = ['telegram_id', 'first_name', 'last_name', 'username']
