from django.contrib import admin
from apps.products.models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order', 'is_active']
    list_filter = ['is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'tag', 'in_stock', 'price_per_kg']
    list_filter = ['category', 'tag', 'in_stock']
    search_fields = ['name']
    inlines = [ProductImageInline]
