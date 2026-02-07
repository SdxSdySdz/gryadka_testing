from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('api/users/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/categories/', include('apps.products.category_urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/settings/', include('apps.settings_app.urls')),
    path('api/admin/analytics/', include('apps.analytics.urls')),
    path('api/bot/', include('apps.bot.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
