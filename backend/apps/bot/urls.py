from django.urls import path
from apps.bot import views

urlpatterns = [
    path('webhook/', views.webhook, name='bot-webhook'),
]
