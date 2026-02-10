from django.urls import path
from apps.products import views

urlpatterns = [
    # Public
    path('', views.category_list, name='category-list'),
    # Admin
    path('admin/', views.admin_category_list_create, name='admin-category-list'),
    path('admin/bulk/', views.admin_category_bulk, name='admin-category-bulk'),
    path('admin/<int:pk>/', views.admin_category_detail, name='admin-category-detail'),
]
