from rest_framework import serializers
from apps.products.models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image', 'sort_order', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product lists."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name',
            'price_per_kg', 'price_per_unit', 'price_per_pack', 'price_per_box',
            'old_price', 'tag', 'in_stock', 'main_image',
        ]

    def get_main_image(self, obj):
        img = obj.images.first()
        if img and img.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product serializer with all images."""
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'description',
            'price_per_kg', 'price_per_unit', 'price_per_pack', 'price_per_box',
            'old_price', 'tag', 'in_stock', 'images', 'created_at',
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin)."""
    class Meta:
        model = Product
        fields = [
            'name', 'category', 'description',
            'price_per_kg', 'price_per_unit', 'price_per_pack', 'price_per_box',
            'old_price', 'tag', 'in_stock',
        ]
