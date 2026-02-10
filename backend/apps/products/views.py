from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.products.models import Category, Product, ProductImage
from apps.products.serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ProductImageSerializer,
)


# ─── Public endpoints ──────────────────────────────────────

@api_view(['GET'])
def category_list(request):
    """List all active categories."""
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_list(request):
    """List products with optional filters."""
    qs = Product.objects.select_related('category').prefetch_related('images')

    # Filter by category
    category_id = request.query_params.get('category')
    if category_id:
        qs = qs.filter(category_id=category_id)

    # Filter by tag
    tag = request.query_params.get('tag')
    if tag:
        qs = qs.filter(tag=tag)

    # Filter in_stock only
    in_stock = request.query_params.get('in_stock')
    if in_stock == '1':
        qs = qs.filter(in_stock=True)

    # Search by name
    search = request.query_params.get('search')
    if search:
        qs = qs.filter(name__icontains=search)

    serializer = ProductListSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def product_detail(request, pk):
    """Get single product with all images."""
    try:
        product = Product.objects.select_related('category').prefetch_related('images').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    serializer = ProductDetailSerializer(product, context={'request': request})
    return Response(serializer.data)


# ─── Admin endpoints ───────────────────────────────────────

@api_view(['GET', 'POST'])
def admin_category_list_create(request):
    """Admin: list all categories or create one."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = CategorySerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(is_active=True)
    return Response(serializer.data, status=201)


@api_view(['PATCH', 'DELETE'])
def admin_category_detail(request, pk):
    """Admin: update or delete a category."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=404)

    if request.method == 'DELETE':
        category.delete()
        return Response(status=204)

    serializer = CategorySerializer(category, data=request.data, partial=True, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def admin_product_list_create(request):
    """Admin: list all products or create one."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    if request.method == 'GET':
        products = Product.objects.select_related('category').prefetch_related('images').all()
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = ProductCreateUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.save()

    # Handle uploaded images
    images = request.FILES.getlist('images')
    for i, img in enumerate(images):
        ProductImage.objects.create(product=product, image=img, sort_order=i)

    return Response(ProductDetailSerializer(product, context={'request': request}).data, status=201)


@api_view(['GET', 'PATCH', 'DELETE'])
def admin_product_detail(request, pk):
    """Admin: get, update, or delete a product."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        product = Product.objects.select_related('category').prefetch_related('images').get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

    if request.method == 'GET':
        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(serializer.data)

    if request.method == 'DELETE':
        product.delete()
        return Response(status=204)

    serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    product = serializer.save()

    # Handle new uploaded images
    images = request.FILES.getlist('images')
    if images:
        for i, img in enumerate(images):
            ProductImage.objects.create(
                product=product, image=img,
                sort_order=product.images.count() + i,
            )

    return Response(ProductDetailSerializer(product, context={'request': request}).data)


@api_view(['DELETE'])
def admin_product_image_delete(request, pk):
    """Admin: delete a product image."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    try:
        image = ProductImage.objects.get(pk=pk)
    except ProductImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=404)

    image.delete()
    return Response(status=204)


@api_view(['POST'])
def admin_category_bulk(request):
    """Admin: bulk action on categories (activate / deactivate / delete)."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    ids = request.data.get('ids', [])
    action = request.data.get('action', '')

    if not ids:
        return Response({'error': 'ids is required'}, status=400)

    qs = Category.objects.filter(id__in=ids)

    if action == 'activate':
        qs.update(is_active=True)
    elif action == 'deactivate':
        qs.update(is_active=False)
    elif action == 'delete':
        qs.delete()
    else:
        return Response({'error': 'Invalid action'}, status=400)

    return Response({'ok': True})


@api_view(['POST'])
def admin_product_bulk(request):
    """Admin: bulk action on products (delete / out_of_stock / in_stock / move)."""
    if not request.tma_user.is_admin:
        return Response({'error': 'Forbidden'}, status=403)

    ids = request.data.get('ids', [])
    action = request.data.get('action', '')

    if not ids:
        return Response({'error': 'ids is required'}, status=400)

    qs = Product.objects.filter(id__in=ids)

    if action == 'delete':
        qs.delete()
    elif action == 'out_of_stock':
        qs.update(in_stock=False)
    elif action == 'in_stock':
        qs.update(in_stock=True)
    elif action == 'move':
        category_id = request.data.get('category_id')
        if not category_id:
            return Response({'error': 'category_id is required for move'}, status=400)
        try:
            Category.objects.get(pk=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=404)
        qs.update(category_id=category_id)
    else:
        return Response({'error': 'Invalid action'}, status=400)

    return Response({'ok': True})
