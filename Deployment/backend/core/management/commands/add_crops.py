from django.core.management.base import BaseCommand
from core.models import Crop

class Command(BaseCommand):
    help = 'Add a list of crops with their appropriate details'

    def handle(self, *args, **kwargs):
        crops_data = [
            {
                'name': 'Tomato',
                'description': 'A popular nightshade vegetable with numerous varieties grown worldwide.',
                'planting_start_month': 2,  # March
                'planting_end_month': 4,  # May
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 9,  # October
                'growth_days_min': 60,
                'growth_days_max': 85,
                'seed_depth': '1/4 inch',
                'row_spacing': '24-36 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': 'Regular watering, 1-2 inches per week',
                'min_soil_temp': 60.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 6.8,
                'sun_requirement': 'Full Sun',
                'notes': 'Stake or cage plants for better air circulation and to keep fruit off the ground.',
                'companion_plants': 'Basil, Marigold, Carrots, Asparagus',
                'antagonistic_plants': 'Potatoes, Corn, Fennel, Cabbage'
            },
            {
                'name': 'Potato',
                'description': 'A starchy root vegetable and member of the nightshade family.',
                'planting_start_month': 2,  # March 
                'planting_end_month': 4,  # May
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 8,  # September
                'growth_days_min': 70,
                'growth_days_max': 120,
                'seed_depth': '4-6 inches',
                'row_spacing': '30-36 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-2 inches per week, critical during flowering and tuber formation',
                'min_soil_temp': 45.0,
                'optimal_ph_min': 5.8,
                'optimal_ph_max': 6.5,
                'sun_requirement': 'Full Sun',
                'notes': 'Hill soil around plants as they grow to prevent green tubers.',
                'companion_plants': 'Beans, Corn, Cabbage, Horseradish',
                'antagonistic_plants': 'Tomatoes, Squash, Cucumber, Sunflowers'
            },
            {
                'name': 'Carrot',
                'description': 'A root vegetable rich in beta-carotene and other nutrients.',
                'planting_start_month': 1,  # February
                'planting_end_month': 7,  # August
                'harvesting_start_month': 4,  # May
                'harvesting_end_month': 10,  # November
                'growth_days_min': 50,
                'growth_days_max': 80,
                'seed_depth': '1/4 inch',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': 'Consistent moisture especially during germination',
                'min_soil_temp': 45.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun to Partial Shade',
                'notes': 'Loose, sandy soil produces the best roots; avoid rocky soil.',
                'companion_plants': 'Peas, Lettuce, Rosemary, Sage, Tomatoes',
                'antagonistic_plants': 'Dill, Parsnips, Radish'
            },
            {
                'name': 'Lettuce',
                'description': 'A leafy green vegetable commonly used in salads and sandwiches.',
                'planting_start_month': 1,  # February
                'planting_end_month': 8,  # September
                'harvesting_start_month': 3,  # April
                'harvesting_end_month': 10,  # November
                'growth_days_min': 30,
                'growth_days_max': 60,
                'seed_depth': '1/8 inch',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': 'Consistent moisture, about 1 inch per week',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Partial Shade to Full Sun',
                'notes': 'Heat-resistant varieties are available for summer planting.',
                'companion_plants': 'Carrots, Radishes, Strawberries, Cucumbers',
                'antagonistic_plants': 'Broccoli, Cabbage'
            },
            {
                'name': 'Cucumber',
                'description': 'A widely cultivated plant in the gourd family that yields the cucumber fruit.',
                'planting_start_month': 4,  # May
                'planting_end_month': 5,  # June
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 8,  # September
                'growth_days_min': 50,
                'growth_days_max': 70,
                'seed_depth': '1 inch',
                'row_spacing': '36-60 inches',
                'water_requirement': 'HIGH',
                'water_schedule': 'Regular watering, 1-2 inches per week',
                'min_soil_temp': 60.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Provide trellis support for climbing varieties to save space.',
                'companion_plants': 'Beans, Corn, Peas, Radishes, Sunflowers',
                'antagonistic_plants': 'Potatoes, Aromatic Herbs'
            },
            {
                'name': 'Onion',
                'description': 'A bulbous vegetable with layers of fleshy leaves inside a papery outer skin.',
                'planting_start_month': 0,  # January
                'planting_end_month': 3,  # April
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 8,  # September
                'growth_days_min': 90,
                'growth_days_max': 120,
                'seed_depth': '1/2 inch',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1 inch per week until bulbing begins, then reduce',
                'min_soil_temp': 45.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Stop watering when tops begin to fall over and dry.',
                'companion_plants': 'Carrots, Tomatoes, Beets, Lettuce',
                'antagonistic_plants': 'Beans, Peas, Asparagus'
            },
            {
                'name': 'Bell Pepper',
                'description': 'A colorful, sweet-tasting vegetable in the nightshade family.',
                'planting_start_month': 3,  # April
                'planting_end_month': 5,  # June
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 9,  # October
                'growth_days_min': 60,
                'growth_days_max': 90,
                'seed_depth': '1/4 inch',
                'row_spacing': '18-24 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-2 inches per week, consistent moisture',
                'min_soil_temp': 65.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 6.8,
                'sun_requirement': 'Full Sun',
                'notes': 'Peppers change color and sweeten as they mature.',
                'companion_plants': 'Basil, Onions, Carrots, Tomatoes',
                'antagonistic_plants': 'Fennel, Kohlrabi, Apricot Trees'
            },
            {
                'name': 'Corn',
                'description': 'A tall cereal plant with large ears covered in kernels.',
                'planting_start_month': 4,  # May
                'planting_end_month': 5,  # June
                'harvesting_start_month': 7,  # August
                'harvesting_end_month': 8,  # September
                'growth_days_min': 60,
                'growth_days_max': 100,
                'seed_depth': '1-2 inches',
                'row_spacing': '30-36 inches',
                'water_requirement': 'HIGH',
                'water_schedule': '1-2 inches per week, critical during silking and tasseling',
                'min_soil_temp': 60.0,
                'optimal_ph_min': 5.8,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Plant in blocks rather than rows for better pollination.',
                'companion_plants': 'Beans, Cucumbers, Squash, Peas',
                'antagonistic_plants': 'Tomatoes, Celery'
            },
            {
                'name': 'Spinach',
                'description': 'A leafy green vegetable rich in iron and other nutrients.',
                'planting_start_month': 2,  # March
                'planting_end_month': 4,  # May (and again in fall)
                'harvesting_start_month': 4,  # May
                'harvesting_end_month': 5,  # June (and again in fall)
                'growth_days_min': 35,
                'growth_days_max': 45,
                'seed_depth': '1/2 inch',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': 'Consistent moisture, about 1-1.5 inches per week',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.5,
                'optimal_ph_max': 7.5,
                'sun_requirement': 'Partial Shade to Full Sun',
                'notes': 'Grows best in cool weather; will bolt (go to seed) in hot temperatures.',
                'companion_plants': 'Strawberries, Peas, Beans, Cabbage Family',
                'antagonistic_plants': 'Potatoes'
            },
            {
                'name': 'Zucchini',
                'description': 'A summer squash with tender flesh and edible skin and seeds.',
                'planting_start_month': 4,  # May
                'planting_end_month': 6,  # July
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 9,  # October
                'growth_days_min': 40,
                'growth_days_max': 55,
                'seed_depth': '1 inch',
                'row_spacing': '36-48 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-2 inches per week at the base of the plant',
                'min_soil_temp': 60.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.5,
                'sun_requirement': 'Full Sun',
                'notes': 'Harvest when young (6-8 inches) for best flavor and texture.',
                'companion_plants': 'Corn, Beans, Nasturtiums, Oregano',
                'antagonistic_plants': 'Potatoes'
            },
            {
                'name': 'Broccoli',
                'description': 'A nutritious vegetable in the cabbage family with dense, edible flower heads.',
                'planting_start_month': 2,  # March (spring)
                'planting_end_month': 7,  # August (for fall crop)
                'harvesting_start_month': 5,  # June (spring crop)
                'harvesting_end_month': 10,  # November (fall crop)
                'growth_days_min': 80,
                'growth_days_max': 100,
                'seed_depth': '1/2 inch',
                'row_spacing': '18-24 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-1.5 inches per week, consistent moisture',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'After harvesting the main head, side shoots will continue to develop.',
                'companion_plants': 'Potatoes, Onions, Celery, Chamomile',
                'antagonistic_plants': 'Tomatoes, Strawberries'
            },
            {
                'name': 'Watermelon',
                'description': 'A large, sweet fruit with juicy red flesh and black seeds.',
                'planting_start_month': 4,  # May
                'planting_end_month': 5,  # June
                'harvesting_start_month': 7,  # August
                'harvesting_end_month': 8,  # September
                'growth_days_min': 70,
                'growth_days_max': 100,
                'seed_depth': '1 inch',
                'row_spacing': '72-96 inches',
                'water_requirement': 'HIGH',
                'water_schedule': 'Heavy watering, 1-2 inches per week, reducing as fruit ripens',
                'min_soil_temp': 70.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 6.8,
                'sun_requirement': 'Full Sun',
                'notes': 'Needs lots of space; vines can reach 20 feet in length.',
                'companion_plants': 'Corn, Nasturtiums, Sunflowers',
                'antagonistic_plants': 'Potatoes'
            },
            {
                'name': 'Strawberry',
                'description': 'A sweet, red heart-shaped fruit with seeds on its exterior.',
                'planting_start_month': 2,  # March
                'planting_end_month': 3,  # April
                'harvesting_start_month': 5,  # June
                'harvesting_end_month': 8,  # September
                'growth_days_min': 60, # to first harvest
                'growth_days_max': 120, # for full production
                'seed_depth': 'Crown at soil level',
                'row_spacing': '12-18 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1-2 inches per week, keeping foliage dry',
                'min_soil_temp': 50.0,
                'optimal_ph_min': 5.5,
                'optimal_ph_max': 6.5,
                'sun_requirement': 'Full Sun',
                'notes': 'Mulch around plants to keep berries clean and prevent rot.',
                'companion_plants': 'Spinach, Lettuce, Beans, Borage',
                'antagonistic_plants': 'Cabbage Family, Tomatoes'
            },
            {
                'name': 'Garlic',
                'description': 'A pungent bulb composed of individual cloves with numerous medicinal properties.',
                'planting_start_month': 9,  # October (fall)
                'planting_end_month': 10,  # November (fall)
                'harvesting_start_month': 6,  # July
                'harvesting_end_month': 7,  # August
                'growth_days_min': 240,
                'growth_days_max': 300,
                'seed_depth': '2 inches',
                'row_spacing': '12-18 inches',
                'water_requirement': 'LOW',
                'water_schedule': '1/2 inch per week, stop watering 2 weeks before harvest',
                'min_soil_temp': 32.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Plant individual cloves pointed end up; mulch well in cold regions.',
                'companion_plants': 'Tomatoes, Carrots, Cabbage Family',
                'antagonistic_plants': 'Peas, Beans, Asparagus'
            },
            {
                'name': 'Basil',
                'description': 'An aromatic herb with flavorful leaves used in many cuisines.',
                'planting_start_month': 4,  # May
                'planting_end_month': 5,  # June
                'harvesting_start_month': 5,  # June
                'harvesting_end_month': 9,  # October
                'growth_days_min': 21,
                'growth_days_max': 30,
                'seed_depth': '1/4 inch',
                'row_spacing': '10-12 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1 inch per week, consistent moisture',
                'min_soil_temp': 50.0,
                'optimal_ph_min': 6.0,
                'optimal_ph_max': 7.0,
                'sun_requirement': 'Full Sun',
                'notes': 'Pinch off flower buds to encourage leaf production and prevent bitterness.',
                'companion_plants': 'Tomatoes, Peppers, Oregano',
                'antagonistic_plants': 'Rue'
            },
            {
                'name': 'Cabbage',
                'description': 'A leafy green/purple biennial grown as an annual vegetable for its dense head.',
                'planting_start_month': 2,  # March (spring)
                'planting_end_month': 7,  # August (for fall crop)
                'harvesting_start_month': 5,  # June (spring crop)
                'harvesting_end_month': 10,  # November (fall crop)
                'growth_days_min': 70,
                'growth_days_max': 120,
                'seed_depth': '1/2 inch',
                'row_spacing': '24-36 inches',
                'water_requirement': 'MEDIUM',
                'water_schedule': '1.5 inches per week, consistent moisture',
                'min_soil_temp': 40.0,
                'optimal_ph_min': 6.5,
                'optimal_ph_max': 7.5,
                'sun_requirement': 'Full Sun',
                'notes': 'Keep soil consistently moist for best head development.',
                'companion_plants': 'Celery, Dill, Chamomile, Sage',
                'antagonistic_plants': 'Strawberries, Tomatoes'
            }
        ]
        
        # Count for reporting
        created_count = 0
        updated_count = 0
        
        for crop_data in crops_data:
            crop, created = Crop.objects.update_or_create(
                name=crop_data['name'],
                defaults=crop_data
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully added/updated crops. Created: {created_count}, Updated: {updated_count}')
        )
