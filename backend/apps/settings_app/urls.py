from django.urls import path
from apps.settings_app import views

urlpatterns = [
    # Public
    path('', views.public_settings, name='public-settings'),
    # Admin
    path('admin/', views.admin_shop_settings, name='admin-shop-settings'),
    path('admin/payment-methods/', views.admin_payment_methods, name='admin-payment-methods'),
    path('admin/payment-methods/<int:pk>/', views.admin_payment_method_detail, name='admin-payment-method-detail'),
    path('admin/delivery-methods/', views.admin_delivery_methods, name='admin-delivery-methods'),
    path('admin/delivery-methods/<int:pk>/', views.admin_delivery_method_detail, name='admin-delivery-method-detail'),
    path('admin/delivery-districts/', views.admin_delivery_districts, name='admin-delivery-districts'),
    path('admin/delivery-districts/<int:pk>/', views.admin_delivery_district_detail, name='admin-delivery-district-detail'),
    path('admin/delivery-intervals/', views.admin_delivery_intervals, name='admin-delivery-intervals'),
    path('admin/delivery-intervals/<int:pk>/', views.admin_delivery_interval_detail, name='admin-delivery-interval-detail'),
]
