from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='deliverymethod',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Стоимость доставки (₽)'),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='free_delivery_threshold',
            field=models.DecimalField(decimal_places=2, default=5000, max_digits=10, verbose_name='Бесплатная доставка от (₽)'),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='urgency_surcharge',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Наценка за срочность (₽)'),
        ),
    ]
