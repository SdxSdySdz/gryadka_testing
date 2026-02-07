from django.urls import path
from apps.chat import views

urlpatterns = [
    # Client
    path('open/', views.client_open_chat, name='client-open-chat'),
    path('messages/', views.client_messages, name='client-messages'),
    path('messages/send/', views.client_send_message, name='client-send-message'),
    # Admin
    path('admin/rooms/', views.admin_chat_rooms, name='admin-chat-rooms'),
    path('admin/rooms/<int:room_id>/messages/', views.admin_room_messages, name='admin-room-messages'),
    path('admin/rooms/<int:room_id>/messages/send/', views.admin_send_message, name='admin-send-message'),
]
