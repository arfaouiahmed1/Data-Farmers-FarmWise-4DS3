from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Farmer, Farm

class Command(BaseCommand):
    help = 'Create a farm for a specific user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the farm owner')
        parser.add_argument('farm_name', type=str, help='Name of the farm')
        parser.add_argument('--soil-type', type=str, default='Loamy', help='Soil type')
        parser.add_argument('--address', type=str, default='', help='Farm address')

    def handle(self, *args, **options):
        username = options['username']
        farm_name = options['farm_name']
        soil_type = options['soil_type']
        address = options['address']
        
        try:
            user = User.objects.get(username=username)
            self.stdout.write(f'Found user: {user.username}')
            
            # Make sure user has a profile
            if not hasattr(user, 'profile'):
                self.stdout.write('Creating profile for user')
                profile = UserProfile.objects.create(user=user, user_type='FARMER')
            else:
                profile = user.profile
                # Make sure profile type is FARMER
                if profile.user_type != 'FARMER':
                    self.stdout.write('Setting user type to FARMER')
                    profile.user_type = 'FARMER'
                    profile.save()
                    
            # Make sure user has a farmer profile
            if not hasattr(profile, 'farmer_profile'):
                self.stdout.write('Creating farmer profile for user')
                farmer = Farmer.objects.create(profile=profile)
            else:
                farmer = profile.farmer_profile
                
            # Check if a farm with this name already exists for this user
            existing_farm = Farm.objects.filter(owner=farmer, name=farm_name).first()
            if existing_farm:
                self.stdout.write(self.style.WARNING(f'Farm "{farm_name}" already exists for user {username}'))
                return
                
            # Create the farm
            farm = Farm.objects.create(
                name=farm_name,
                owner=farmer,
                address=address,
                soil_type=soil_type,
                irrigation_type='Drip',
                farming_method='Organic',
                has_water_access=True,
                has_road_access=True,
                has_electricity=True
            )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created farm "{farm_name}" for user {username}'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist')) 