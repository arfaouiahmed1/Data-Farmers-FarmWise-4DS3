from django.core.management.base import BaseCommand
from core.models import Crop

class Command(BaseCommand):
    help = 'Update existing crops with appropriate details'

    def handle(self, *args, **kwargs):
        # Data for updating crops
        crops_data = [
            {
                'name': 'Wheat',
                'description': 'A cereal grain cultivated worldwide and one of the most important staple food crops.',
                'planting_start_month': 9,  # October
                'planting_end_month': 10,  # November (fall planting for winter wheat)
                'harvesting_start_month': 5,  # June
                'harvesting_end_month': 7,  # August
                'growth_days_min': 180,
                'growth_days_max': 240,
                'seed_depth': '1-1.5 inches',
                'row_spacing': '6-8 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': 'Moderate watering during growth stages, less during maturation',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Winter wheat is planted in fall and harvested in summer; spring wheat is planted in spring and harvested in late summer.',
                'companion_plants': 'Clover, Beans, Peas',
                'antagonistic_plants': 'Sunflowers'
            },
            {
                'name': 'alfalfa',
                'description': 'A perennial flowering plant in the legume family cultivated as an important forage crop.',
                'planting_start_month': 3,  # April
                'planting_end_month': 4,  # May
                'harvesting_start_month': 5,  # June
                'harvesting_end_month': 9,  # October (multiple cuttings)
                'growth_days_min': 60,  # to first cutting
                'growth_days_max': 365,  # perennial, lives for several years
                'seed_depth': '1/4-1/2 inch',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-2 inches per week, drought tolerant after establishment',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.5,
                'optimal_ph_max': 7.5,
                'sun_requirement': 'Full Sun',
                'notes': 'Fixes nitrogen in the soil. Can be harvested multiple times per season, typically every 25-40 days.',
                'companion_plants': 'Clover, Grass, Corn',
                'antagonistic_plants': 'Other legumes competing for the same nutrients'
            }
        ]
        
        # Update the crops
        updated_count = 0
        
        for crop_data in crops_data:
            crop_name = crop_data.pop('name')
            try:
                crop = Crop.objects.get(name=crop_name)
                
                # Update all fields
                for field, value in crop_data.items():
                    setattr(crop, field, value)
                
                crop.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated crop: {crop_name}"))
                
            except Crop.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Crop not found: {crop_name}"))
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} crops.')
        )
