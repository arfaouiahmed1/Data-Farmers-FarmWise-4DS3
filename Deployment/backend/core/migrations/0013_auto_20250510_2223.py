# Generated by Django 5.2 on 2025-05-10 21:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_remove_userprofile_theme_preference_equipment_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Equipment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=50)),
                ('purchase_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Operational', 'Operational'), ('Maintenance Needed', 'Maintenance Needed'), ('Out of Service', 'Out of Service')], default='Operational', max_length=20)),
                ('next_maintenance', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('farmer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equipment', to='core.farmer')),
            ],
        ),
    ]
