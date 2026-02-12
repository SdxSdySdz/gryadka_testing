from django.urls import path
from apps.orders import views

urlpatterns = [
    path('', views.order_list_create, name='order-list-create'),
    path('<int:pk>/', views.order_detail, name='order-detail'),
    path('admin/', views.admin_order_list, name='admin-order-list'),
    path('admin/bulk/', views.admin_order_bulk, name='admin-order-bulk'),
    path('admin/<int:pk>/', views.admin_order_update, name='admin-order-update'),
]
