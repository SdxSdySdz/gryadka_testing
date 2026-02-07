from django.urls import path
from apps.analytics import views

urlpatterns = [
    path('', views.analytics, name='analytics'),
]
