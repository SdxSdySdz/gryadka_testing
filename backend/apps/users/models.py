from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, telegram_id, **extra_fields):
        user = self.model(telegram_id=telegram_id, **extra_fields)
        user.save(using=self._db)
        return user

    def create_superuser(self, telegram_id, **extra_fields):
        extra_fields['is_admin'] = True
        return self.create_user(telegram_id, **extra_fields)


class User(AbstractBaseUser):
    telegram_id = models.BigIntegerField(unique=True, db_index=True)
    first_name = models.CharField(max_length=255, blank=True, default='')
    last_name = models.CharField(max_length=255, blank=True, default='')
    username = models.CharField(max_length=255, blank=True, default='')
    photo_url = models.URLField(max_length=500, blank=True, default='')
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # AbstractBaseUser requires password but we don't use it
    password = None

    objects = UserManager()

    USERNAME_FIELD = 'telegram_id'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        name = self.first_name
        if self.last_name:
            name += f' {self.last_name}'
        return f'{name} ({self.telegram_id})'

    @property
    def display_name(self):
        name = self.first_name
        if self.last_name:
            name += f' {self.last_name}'
        return name or str(self.telegram_id)

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin
