# Generated by Django 5.2 on 2025-05-12 18:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_crop_antagonistic_plants_crop_companion_plants_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cropclassification',
            name='temperature',
            field=models.DecimalField(decimal_places=2, max_digits=6, verbose_name='Temperature (°C)'),
        ),
    ]
