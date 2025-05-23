# Generated by Django 5.2 on 2025-05-12 16:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_create_missing_cropclassification_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cropclassification',
            name='irrigation',
            field=models.CharField(choices=[('Drip', 'Drip Irrigation'), ('Sprinkler', 'Sprinkler System'), ('Flood', 'Flood Irrigation'), ('Furrow', 'Furrow Irrigation'), ('None', 'No Irrigation')], max_length=20, verbose_name='Irrigation Method'),
        ),
    ]
