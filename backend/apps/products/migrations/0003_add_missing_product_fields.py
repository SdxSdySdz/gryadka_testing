from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_replace_old_price_with_per_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='price_per_100g',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Цена за 100 грамм', max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='available_grams',
            field=models.CharField(blank=True, default='', help_text='Доступные граммовки через запятую (напр. 250,300,500)', max_length=255),
        ),
        migrations.AddField(
            model_name='product',
            name='box_weight',
            field=models.PositiveIntegerField(blank=True, help_text='Вес коробки в граммах', null=True),
        ),
        migrations.AddField(
            model_name='product',
            name='pack_weight',
            field=models.PositiveIntegerField(blank=True, help_text='Вес упаковки в граммах', null=True),
        ),
    ]
