from django.core.management.base import BaseCommand
from core.models import Crop

class Command(BaseCommand):
    help = 'List all crops in the database'

    def handle(self, *args, **kwargs):
        crops = Crop.objects.all()
        self.stdout.write(f"Total crops: {crops.count()}")
        
        for crop in crops:
            planting_window = crop.get_planting_window_display()
            harvesting_window = crop.get_harvesting_window_display()
            water_req = crop.water_requirement if crop.water_requirement else "Unknown"
            
            self.stdout.write(
                f"{crop.name}: \n"
                f"  - Planting: {planting_window}\n"
                f"  - Harvesting: {harvesting_window}\n"
                f"  - Water: {water_req}\n"
                f"  - Growth: {crop.get_growth_days_display()}\n"
            )
