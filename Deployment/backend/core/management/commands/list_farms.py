from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Farm

class Command(BaseCommand):
    help = 'List all farms in the system'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Filter farms by username')

    def handle(self, *args, **options):
        username = options.get('username')
        
        if username:
            try:
                user = User.objects.get(username=username)
                farms = Farm.objects.filter(owner__profile__user=user)
                self.stdout.write(f'Farms for user {username}:')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User {username} does not exist'))
                return
        else:
            farms = Farm.objects.all()
            self.stdout.write(f'All farms ({farms.count()}):')
        
        if farms.exists():
            for farm in farms:
                self.stdout.write(
                    f'ID: {farm.id} | '
                    f'Name: {farm.name} | '
                    f'Owner: {farm.owner.profile.user.username} | '
                    f'Soil: {farm.soil_type} | '
                    f'Created: {farm.created_at}'
                )
        else:
            self.stdout.write(self.style.WARNING('No farms found')) 