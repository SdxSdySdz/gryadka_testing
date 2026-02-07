from django.urls import path
from apps.users import views

urlpatterns = [
    path('me/', views.me, name='user-me'),
    path('admin/', views.admin_list, name='admin-list'),
    path('admin/add/', views.admin_add, name='admin-add'),
    path('admin/<int:telegram_id>/remove/', views.admin_remove, name='admin-remove'),
]
