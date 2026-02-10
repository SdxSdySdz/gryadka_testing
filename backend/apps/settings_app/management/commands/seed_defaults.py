from django.core.management.base import BaseCommand
from apps.settings_app.models import (
    ShopSettings,
    PaymentMethod,
    DeliveryMethod,
    DeliveryDistrict,
    DeliveryInterval,
)


class Command(BaseCommand):
    help = 'Seed default shop settings'

    def handle(self, *args, **options):
        # Shop settings
        ShopSettings.load()
        self.stdout.write('Shop settings created')

        # Payment methods
        defaults = ['Наличные', 'Перевод']
        for i, name in enumerate(defaults):
            PaymentMethod.objects.get_or_create(name=name, defaults={'sort_order': i})
        self.stdout.write(f'Payment methods: {", ".join(defaults)}')

        # Delivery methods
        delivery_defaults = [
            {'name': 'До подъезда', 'price': 200, 'sort_order': 0},
            {'name': 'До двери', 'price': 350, 'sort_order': 1},
        ]
        for d in delivery_defaults:
            DeliveryMethod.objects.get_or_create(
                name=d['name'],
                defaults={'price': d['price'], 'sort_order': d['sort_order']},
            )
        self.stdout.write(f'Delivery methods: {", ".join(d["name"] for d in delivery_defaults)}')

        # Delivery districts
        defaults = ['Район 1', 'Район 2']
        for name in defaults:
            DeliveryDistrict.objects.get_or_create(name=name)
        self.stdout.write(f'Delivery districts: {", ".join(defaults)}')

        # Delivery intervals
        defaults = ['9:00 - 15:00', '16:00 - 20:00']
        for i, label in enumerate(defaults):
            DeliveryInterval.objects.get_or_create(label=label, defaults={'sort_order': i})
        self.stdout.write(f'Delivery intervals: {", ".join(defaults)}')

        self.stdout.write(self.style.SUCCESS('Default settings seeded successfully'))
