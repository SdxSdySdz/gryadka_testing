from django.urls import path
from apps.products import views

urlpatterns = [
    # Public
    path('', views.product_list, name='product-list'),
    path('<int:pk>/', views.product_detail, name='product-detail'),
    # Admin
    path('admin/', views.admin_product_list_create, name='admin-product-list'),
    path('admin/bulk/', views.admin_product_bulk, name='admin-product-bulk'),
    path('admin/<int:pk>/', views.admin_product_detail, name='admin-product-detail'),
    path('admin/images/<int:pk>/', views.admin_product_image_delete, name='admin-product-image-delete'),
]
