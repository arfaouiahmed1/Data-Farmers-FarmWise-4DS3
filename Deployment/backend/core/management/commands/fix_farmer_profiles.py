from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Farmer

class Command(BaseCommand):
    help = 'Fix missing Farmer profiles for users'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to fix farmer profiles...'))

        # Get all user profiles with user_type='FARMER'
        farmer_profiles = UserProfile.objects.filter(user_type='FARMER')
        
        for profile in farmer_profiles:
            if not hasattr(profile, 'farmer_profile'):
                self.stdout.write(f'Creating missing farmer profile for {profile.user.username}')
                Farmer.objects.create(profile=profile)
            else:
                self.stdout.write(f'Farmer profile already exists for {profile.user.username}')
        
        # Count results
        total_farmers = UserProfile.objects.filter(user_type='FARMER').count()
        fixed_farmers = Farmer.objects.count()
        
        self.stdout.write(self.style.SUCCESS(f'Fixed farmer profiles! {fixed_farmers} out of {total_farmers} profiles now have Farmer records.')) 