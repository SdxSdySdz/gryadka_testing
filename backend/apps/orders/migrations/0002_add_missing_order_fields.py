from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='address',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='is_urgent',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order',
            name='urgency_surcharge',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='price_type',
            field=models.CharField(choices=[('kg', 'за кг'), ('gram', 'за граммовку'), ('box', 'за ящик'), ('pack', 'за упаковку'), ('unit', 'за штуку')], default='kg', max_length=10),
        ),
    ]
