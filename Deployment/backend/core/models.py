from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import numpy as np

# Create your models here.

class UserProfile(models.Model):
    USER_TYPES = [
        ('FARMER', 'Farmer'),
        ('AGRONOMIST', 'Agronomist'),
        ('ADMIN', 'Administrator'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='FARMER')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    onboarding_completed = models.BooleanField(default=False)
    onboarding_progress = models.JSONField(blank=True, null=True, help_text="Stores temporary onboarding progress data")
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def is_farmer(self):
        return self.user_type == 'FARMER'
    
    @property
    def is_admin(self):
        return self.user_type == 'ADMIN'

class Farmer(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='farmer_profile', 
                                   limit_choices_to={'user_type': 'FARMER'})
    farming_experience_years = models.PositiveIntegerField(default=0)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    certification = models.CharField(max_length=100, blank=True, null=True)
    equipment_owned = models.TextField(blank=True, null=True)
    preferred_crops = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Farmer: {self.profile.user.username}"

class Admin(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='admin_profile', 
                                   limit_choices_to={'user_type': 'ADMIN'})
    role = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    permissions_level = models.CharField(max_length=50, default='standard')
    is_super_admin = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Admin: {self.profile.user.username}"

class Farm(models.Model):
    FARM_SIZE_CHOICES = [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
    ]
    
    SOIL_TYPE_CHOICES = [
        ('Clay', 'Clay'),
        ('Sandy', 'Sandy'),
        ('Loamy', 'Loamy'),
        ('Silty', 'Silty'),
        ('Peaty', 'Peaty'),
        ('Chalky', 'Chalky'),
    ]
    
    IRRIGATION_TYPE_CHOICES = [
        ('Drip', 'Drip Irrigation'),
        ('Sprinkler', 'Sprinkler System'),
        ('Flood', 'Flood Irrigation'),
        ('Furrow', 'Furrow Irrigation'),
        ('None', 'No Irrigation'),
    ]
    
    FARMING_METHOD_CHOICES = [
        ('Organic', 'Organic Farming'),
        ('Conventional', 'Conventional Farming'),
        ('Mixed', 'Mixed Methods'),
        ('Permaculture', 'Permaculture'),
        ('Hydroponic', 'Hydroponic'),
    ]
    
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(
        Farmer, 
        on_delete=models.CASCADE, 
        related_name='farms'
    )
    address = models.TextField(blank=True, null=True)
    location_address = models.TextField(blank=True, null=True)  # Optional text address
    description = models.TextField(blank=True, null=True)
    size_hectares = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    size_category = models.CharField(max_length=1, choices=FARM_SIZE_CHOICES, blank=True, null=True)  # Can be derived or set
    boundary_geojson = models.JSONField(blank=True, null=True)
    
    # Soil parameters
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES, blank=True, null=True)
    soil_nitrogen = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)  # N value in PPM
    soil_phosphorus = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)  # P value in PPM
    soil_potassium = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)  # K value in PPM
    soil_ph = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)  # pH value (0-14)
    
    # Infrastructure and accessibility
    has_water_access = models.BooleanField(default=False)  # Whether the farm has water sources
    irrigation_type = models.CharField(max_length=20, choices=IRRIGATION_TYPE_CHOICES, blank=True, null=True)
    has_road_access = models.BooleanField(default=False)  # Whether the farm has road access
    has_electricity = models.BooleanField(default=False)  # Whether the farm has electricity
    storage_capacity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Storage capacity in square meters
    
    # Farming methods and practices
    farming_method = models.CharField(max_length=20, choices=FARMING_METHOD_CHOICES, blank=True, null=True)
    year_established = models.PositiveIntegerField(blank=True, null=True)  # Year the farm was established
    
    # Farm valuation
    estimated_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)  # Farm estimated price
    price_last_updated = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.owner.profile.user.username})"
    
    def get_available_hectares(self):
        """Calculate available hectares for planting new crops"""
        if not self.size_hectares:
            return 0
            
        # Calculate total hectares already used by existing crops
        used_hectares = self.farm_crops.aggregate(
            total=models.Sum('area_planted_hectares')
        )['total'] or 0
        
        # Return available area (can't be negative)
        return max(float(self.size_hectares) - float(used_hectares), 0)
        
    def calculate_estimated_price(self):
        """Calculate and update the farm's estimated price"""
        if not self.size_hectares:
            return None
        
        # Base price per hectare (adjust based on your specific requirements)
        base_price_per_hectare = 5000  # Base price in currency units
        
        # Adjust based on soil quality
        soil_quality_multiplier = 1.0
        if self.soil_ph and self.soil_nitrogen and self.soil_phosphorus and self.soil_potassium:
            # Simple algorithm - can be refined based on agronomic knowledge
            if 6.0 <= self.soil_ph <= 7.5:  # Optimal pH range
                soil_quality_multiplier *= 1.2
            
            # Adjust based on NPK values (simplified)
            if self.soil_nitrogen > 50:  # Good nitrogen level
                soil_quality_multiplier *= 1.1
            if self.soil_phosphorus > 30:  # Good phosphorus level
                soil_quality_multiplier *= 1.1
            if self.soil_potassium > 150:  # Good potassium level
                soil_quality_multiplier *= 1.1
        
        # Calculate price
        price = float(self.size_hectares) * base_price_per_hectare * soil_quality_multiplier
        
        # Update the model
        self.estimated_price = price
        self.price_last_updated = timezone.now()
        self.save(update_fields=['estimated_price', 'price_last_updated'])
        
        return self.estimated_price

class Weather(models.Model):
    WEATHER_CONDITIONS = [
        ('SUNNY', 'Sunny'),
        ('CLOUDY', 'Cloudy'),
        ('PARTLY_CLOUDY', 'Partly Cloudy'),
        ('RAINY', 'Rainy'),
        ('STORMY', 'Stormy'),
        ('SNOWY', 'Snowy'),
        ('FOGGY', 'Foggy'),
        ('WINDY', 'Windy'),
    ]
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='weather_records')
    date = models.DateField()
    condition = models.CharField(max_length=20, choices=WEATHER_CONDITIONS)
    temperature_max = models.DecimalField(max_digits=5, decimal_places=2)  # in Celsius
    temperature_min = models.DecimalField(max_digits=5, decimal_places=2)  # in Celsius
    humidity = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in percentage
    precipitation = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in mm
    wind_speed = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in km/h
    forecast_data = models.JSONField(blank=True, null=True)  # For additional weather data
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['farm', 'date']
        
    def __str__(self):
        return f"Weather for {self.farm.name} on {self.date}"

class Crop(models.Model):
    WATER_REQUIREMENT_CHOICES = [
        ('LOW', 'Low - Drought Tolerant'),
        ('MEDIUM', 'Medium - Average Water Needs'),
        ('HIGH', 'High - Requires Regular Watering'),
        ('VERY_HIGH', 'Very High - Requires Abundant Water'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Planting and harvesting windows (0=January, 11=December)
    planting_start_month = models.IntegerField(blank=True, null=True, help_text="Month index (0-11) when planting typically begins")
    planting_end_month = models.IntegerField(blank=True, null=True, help_text="Month index (0-11) when planting typically ends")
    harvesting_start_month = models.IntegerField(blank=True, null=True, help_text="Month index (0-11) when harvesting typically begins")
    harvesting_end_month = models.IntegerField(blank=True, null=True, help_text="Month index (0-11) when harvesting typically ends")
    
    # Growth information
    growth_days_min = models.IntegerField(blank=True, null=True, help_text="Minimum days to maturity")
    growth_days_max = models.IntegerField(blank=True, null=True, help_text="Maximum days to maturity")
    
    # Planting details
    seed_depth = models.CharField(max_length=50, blank=True, null=True, help_text="Recommended planting depth (e.g., '1-2 inches')")
    row_spacing = models.CharField(max_length=50, blank=True, null=True, help_text="Recommended row spacing (e.g., '30-36 inches')")
    
    # Water requirements
    water_requirement = models.CharField(max_length=10, choices=WATER_REQUIREMENT_CHOICES, blank=True, null=True)
    water_schedule = models.CharField(max_length=100, blank=True, null=True, help_text="Suggested watering frequency/schedule")
    
    # Climate and conditions
    min_soil_temp = models.DecimalField(max_digits=4, decimal_places=1, blank=True, null=True, help_text="Minimum soil temperature for planting (°F)")
    optimal_ph_min = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True, help_text="Minimum optimal soil pH")
    optimal_ph_max = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True, help_text="Maximum optimal soil pH")
    sun_requirement = models.CharField(max_length=50, blank=True, null=True, help_text="Sun exposure needs (e.g., 'Full Sun')")
    
    # Additional information
    notes = models.TextField(blank=True, null=True, help_text="Additional growing notes and tips")
    companion_plants = models.TextField(blank=True, null=True, help_text="Plants that grow well with this crop")
    antagonistic_plants = models.TextField(blank=True, null=True, help_text="Plants that should not be grown with this crop")

    def __str__(self):
        return self.name
    
    def get_growth_days_display(self):
        """Return the growth days range as a string"""
        if self.growth_days_min is not None and self.growth_days_max is not None:
            return f"{self.growth_days_min}-{self.growth_days_max} days"
        elif self.growth_days_min is not None:
            return f"{self.growth_days_min}+ days"
        elif self.growth_days_max is not None:
            return f"Up to {self.growth_days_max} days"
        return "Unknown"
    
    def get_planting_window_display(self):
        """Return the planting window as a string with month names"""
        months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December']
        if self.planting_start_month is not None and self.planting_end_month is not None:
            start = months[self.planting_start_month]
            end = months[self.planting_end_month]
            return f"{start} to {end}"
        return "Unknown"
    
    def get_harvesting_window_display(self):
        """Return the harvesting window as a string with month names"""
        months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December']
        if self.harvesting_start_month is not None and self.harvesting_end_month is not None:
            start = months[self.harvesting_start_month]
            end = months[self.harvesting_end_month]
            return f"{start} to {end}"
        return "Unknown"

class FarmCrop(models.Model):
    GROWTH_STAGE_CHOICES = [
        ('Planting', 'Planting'),
        ('Germination', 'Germination'),
        ('Vegetative', 'Vegetative Growth'),
        ('Flowering', 'Flowering'),
        ('Fruiting', 'Fruiting'),
        ('Harvest', 'Harvest Ready'),
        ('Post-Harvest', 'Post-Harvest'),
    ]
    
    HEALTH_STATUS_CHOICES = [
        ('Excellent', 'Excellent'),
        ('Good', 'Good'),
        ('Fair', 'Fair'),
        ('Poor', 'Poor'),
        ('Critical', 'Critical'),
    ]
    
    WATERING_FREQUENCY_CHOICES = [
        ('Daily', 'Daily'),
        ('Every_2_Days', 'Every 2 Days'),
        ('Every_3_Days', 'Every 3 Days'),
        ('Weekly', 'Weekly'),
        ('Biweekly', 'Biweekly'),
        ('As_Needed', 'As Needed'),
    ]
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
    ]
    
    FERTILIZER_TYPE_CHOICES = [
        ('Urea', 'Urea'),
        ('DAP', 'DAP'),
        ('NPK', 'NPK'),
        ('Organic', 'Organic'),
        ('Other', 'Other'),
    ]
    
    GOVERNORATE_CHOICES = [
        ('Ariana', 'Ariana'),
        ('Beja', 'Beja'),
        ('Ben Arous', 'Ben Arous'),
        ('Bizerte', 'Bizerte'),
        ('Gabes', 'Gabes'),
        ('Gafsa', 'Gafsa'),
        ('Jendouba', 'Jendouba'),
        ('Kairouan', 'Kairouan'),
        ('Kasserine', 'Kasserine'),
        ('Kebili', 'Kebili'),
        ('Kef', 'Kef'),
        ('Mahdia', 'Mahdia'),
        ('Manouba', 'Manouba'),
        ('Medenine', 'Medenine'),
        ('Monastir', 'Monastir'),
        ('Nabeul', 'Nabeul'),
        ('Sfax', 'Sfax'),
        ('Sidi Bouzid', 'Sidi Bouzid'),
        ('Siliana', 'Siliana'),
        ('Sousse', 'Sousse'),
        ('Tataouine', 'Tataouine'),
        ('Tozeur', 'Tozeur'),
        ('Tunis', 'Tunis'),
        ('Zaghouan', 'Zaghouan'),
    ]
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='farm_crops')
    crop = models.ForeignKey(Crop, on_delete=models.PROTECT, related_name='crop_plantings')  # Protect Crop from deletion if used
    planting_date = models.DateField(blank=True, null=True)
    expected_harvest_date = models.DateField(blank=True, null=True)
    area_planted_hectares = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fields that mirror Farm model for classification purposes
    soil_nitrogen = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # N value in kg/ha
    soil_phosphorus = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # P value in kg/ha
    soil_potassium = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # K value in kg/ha
    soil_ph = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)  # pH value (0-14)
    
    # Weather related fields
    temperature = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in Celsius
    humidity = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # in percentage
    rainfall = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)  # in mm
    
    # Location fields
    governorate = models.CharField(max_length=50, blank=True, null=True, choices=GOVERNORATE_CHOICES)
    district = models.CharField(max_length=100, blank=True, null=True)
    
    # Additional classification fields
    fertilizer_amount = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # in kg
    pesticide_amount = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)  # in kg
    fertilizer_type = models.CharField(max_length=20, choices=FERTILIZER_TYPE_CHOICES, blank=True, null=True)
    
    # Season fields
    planting_season = models.CharField(max_length=20, choices=SEASON_CHOICES, blank=True, null=True)
    growing_season = models.CharField(max_length=20, choices=SEASON_CHOICES, blank=True, null=True)
    harvest_season = models.CharField(max_length=20, choices=SEASON_CHOICES, blank=True, null=True)
    
    # Crop management and monitoring
    growth_stage = models.CharField(max_length=20, choices=GROWTH_STAGE_CHOICES, blank=True, null=True)
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES, default='Good')
    notes = models.TextField(blank=True, null=True)  # Field notes about the crop
    last_fertilized = models.DateField(blank=True, null=True)
    watering_frequency = models.CharField(max_length=20, choices=WATERING_FREQUENCY_CHOICES, blank=True, null=True)
    
    # Economics
    planting_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Cost to plant this crop
    expected_yield_per_hectare = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Expected yield per hectare
    projected_revenue = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)  # Projected revenue
    
    # Yield prediction fields
    predicted_yield = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # in tons or appropriate unit
    yield_prediction_date = models.DateTimeField(blank=True, null=True)
    yield_confidence = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)  # confidence level 0-100%

    def __str__(self):
        return f"{self.crop.name} on {self.farm.name}"
    
    def extract_governorate_from_address(self):
        """Extract governorate from farm address"""
        if not self.farm or not self.farm.address:
            return None
            
        address = self.farm.address.lower()
        for gov_code, gov_name in self.GOVERNORATE_CHOICES:
            if gov_name.lower() in address:
                return gov_code
                
        # Default fallback - could use geocoding here in a more sophisticated version
        return None
        
    def get_recent_weather_data(self):
        """Fetch most recent weather data for this farm"""
        if not self.farm:
            return None, None, None
            
        # Get the most recent weather record for this farm
        latest_weather = self.farm.weather_records.order_by('-timestamp').first()
        
        if latest_weather:
            return (
                latest_weather.temperature,
                latest_weather.humidity,
                latest_weather.rainfall
            )
        return None, None, None
    
    def determine_season_from_date(self, date):
        """Determine season from date"""
        if not date:
            return None
            
        # Simple season determination based on month
        month = date.month
        if 3 <= month <= 5:
            return 'spring'
        elif 6 <= month <= 8:
            return 'summer'
        elif 9 <= month <= 11:
            return 'autumn'
        else:
            return 'winter'
    
    def populate_from_farm(self):
        """Populate fields from Farm model"""
        if self.farm:
            self.soil_nitrogen = self.farm.soil_nitrogen
            self.soil_phosphorus = self.farm.soil_phosphorus
            self.soil_potassium = self.farm.soil_potassium
            self.soil_ph = self.farm.soil_ph
            
            # Extract governorate from farm address
            self.governorate = self.extract_governorate_from_address()
            
            # If farm has district info
            if hasattr(self.farm, 'district'):
                self.district = self.farm.district
    
    def populate_weather_data(self):
        """Populate weather data from Weather model"""
        temp, humidity, rain = self.get_recent_weather_data()
        self.temperature = temp
        self.humidity = humidity
        self.rainfall = rain
    
    def populate_season_data(self):
        """Populate season data based on dates"""
        self.planting_season = self.determine_season_from_date(self.planting_date)
        self.harvest_season = self.determine_season_from_date(self.expected_harvest_date)
        
        # Simple growing season logic - could be more sophisticated
        if self.planting_season and self.harvest_season:
            # If planting and harvest are in the same season
            if self.planting_season == self.harvest_season:
                self.growing_season = self.planting_season
            # Simple growing season logic - the season between planting and harvest
            else:
                seasons = ['winter', 'spring', 'summer', 'autumn', 'winter']
                planting_idx = seasons.index(self.planting_season)
                harvest_idx = seasons.index(self.harvest_season)
                
                # If harvest comes after planting in the same year
                if harvest_idx > planting_idx:
                    self.growing_season = seasons[planting_idx + 1]
                # If harvest is in the next year (winter planting, spring harvest)
                else:
                    self.growing_season = seasons[1]  # Default to spring
    
    def save(self, *args, **kwargs):
        # Populate data from related models before saving
        if self.pk is None:  # Only auto-populate on first save
            self.populate_from_farm()
            self.populate_weather_data()
            self.populate_season_data()
        
        super().save(*args, **kwargs)
    
    def clean(self):
        """Validate model data before saving"""
        from django.core.exceptions import ValidationError
        
        if self.area_planted_hectares and self.farm and self.farm.size_hectares:
            # For updates, exclude this instance's current area
            if self.pk:
                used_hectares = self.farm.farm_crops.exclude(pk=self.pk).aggregate(
                    total=models.Sum('area_planted_hectares')
                )['total'] or 0
            else:
                used_hectares = self.farm.farm_crops.aggregate(
                    total=models.Sum('area_planted_hectares')
                )['total'] or 0
                
            # Calculate how much area is available
            available = float(self.farm.size_hectares) - float(used_hectares)
            
            # If area exceeds available space, raise validation error
            if float(self.area_planted_hectares) > available:
                raise ValidationError({
                    'area_planted_hectares': f'The area planted ({self.area_planted_hectares} ha) '
                                            f'exceeds available farm area ({available} ha). '
                                            f'Total farm size is {self.farm.size_hectares} ha.'
                })
    
    def save(self, *args, **kwargs):
        """Override save method to handle area_planted_hectares"""
        # Get original instance if this is an update
        if self.pk:
            try:
                original = FarmCrop.objects.get(pk=self.pk)
                original_area = original.area_planted_hectares or 0
            except FarmCrop.DoesNotExist:
                original_area = 0
        else:
            original_area = 0
        
        # If area_planted_hectares is not set and the farm has a size_hectares value
        if not self.area_planted_hectares and self.farm and self.farm.size_hectares:
            # For a new crop, check available area
            available_hectares = self.farm.get_available_hectares()
            if original_area > 0:  # If updating, add back the original area to available
                available_hectares += float(original_area)
                
            # If farm is empty, use all hectares, otherwise use available hectares
            if available_hectares > 0:
                self.area_planted_hectares = available_hectares
            else:
                self.area_planted_hectares = self.farm.size_hectares
        
        # Ensure area_planted_hectares doesn't exceed the farm's available size
        if self.area_planted_hectares and self.farm and self.farm.size_hectares:
            # Calculate how much area is available
            used_hectares = self.farm.farm_crops.exclude(pk=self.pk).aggregate(
                total=models.Sum('area_planted_hectares')
            )['total'] or 0
            
            max_allowed = float(self.farm.size_hectares) - float(used_hectares)
            
            # Cap the area at the maximum available
            if float(self.area_planted_hectares) > max_allowed:
                self.area_planted_hectares = max_allowed
                
        super().save(*args, **kwargs)
    
    def predict_yield(self):
        """Calculate and update the predicted yield for this crop planting"""
        if not self.area_planted_hectares or not self.farm or not self.crop:
            return None
        
        # Base yield per hectare (this would be based on historical data or crop type)
        base_yield_per_hectare = 4.5  # Example value in tons/hectare
        
        # If user has provided an expected yield per hectare, use that as the base
        if self.expected_yield_per_hectare:
            base_yield_per_hectare = float(self.expected_yield_per_hectare)
        
        # Get weather data if available
        recent_weather = Weather.objects.filter(
            farm=self.farm,
            date__gte=(timezone.now().date() - timezone.timedelta(days=30))
        ).order_by('-date')
        
        # Adjust yield based on soil conditions
        soil_multiplier = 1.0
        if self.farm.soil_ph and self.farm.soil_nitrogen and self.farm.soil_phosphorus and self.farm.soil_potassium:
            # Example simple adjustment based on soil parameters
            if 6.0 <= self.farm.soil_ph <= 7.5:  # Optimal pH range
                soil_multiplier *= 1.15
            else:
                soil_multiplier *= 0.9
                
            # NPK adjustments (simplified)
            if self.farm.soil_nitrogen > 50:
                soil_multiplier *= 1.1
            if self.farm.soil_phosphorus > 30:
                soil_multiplier *= 1.05
            if self.farm.soil_potassium > 150:
                soil_multiplier *= 1.05
        
        # Adjust based on soil type if no detailed soil data
        elif self.farm.soil_type:
            if self.farm.soil_type == 'Loamy':
                soil_multiplier *= 1.2  # Loamy soil is excellent for most crops
            elif self.farm.soil_type == 'Clay':
                soil_multiplier *= 0.9  # Clay can be challenging for some crops
            elif self.farm.soil_type == 'Sandy':
                soil_multiplier *= 0.85  # Sandy soil may have poor nutrient retention
        
        # Weather adjustment (simplified example)
        weather_multiplier = 1.0
        if recent_weather.exists():
            avg_temp_max = recent_weather.aggregate(models.Avg('temperature_max'))['temperature_max__avg']
            avg_rain = recent_weather.aggregate(models.Avg('precipitation'))['precipitation__avg']
            
            # Simple adjustments based on weather
            if avg_temp_max and avg_temp_max > 30:  # Too hot
                weather_multiplier *= 0.9
            elif avg_temp_max and avg_temp_max < 10:  # Too cold
                weather_multiplier *= 0.85
                
            if avg_rain and avg_rain < 5:  # Too dry
                weather_multiplier *= 0.8
            elif avg_rain and avg_rain > 50:  # Too wet
                weather_multiplier *= 0.85
        
        # Crop health adjustment based on growth stage and health status
        health_multiplier = 1.0
        if self.growth_stage and self.health_status:
            # Health status impact
            health_factors = {
                'Excellent': 1.2,
                'Good': 1.0,
                'Fair': 0.85,
                'Poor': 0.7,
                'Critical': 0.5
            }
            
            health_multiplier *= health_factors.get(self.health_status, 1.0)
            
            # Growth stage impact - later stages mean more certainty
            # but reduced potential for yield improvement
            stage_factors = {
                'Planting': 0.9,     # Most uncertain stage
                'Germination': 0.92,
                'Vegetative': 0.95,
                'Flowering': 1.0,    # Critical stage for many crops
                'Fruiting': 1.05,
                'Harvest': 1.1,      # Most certain stage
                'Post-Harvest': 1.1  # Already harvested
            }
            
            health_multiplier *= stage_factors.get(self.growth_stage, 1.0)
        
        # Watering frequency impact (if irrigation data is available)
        irrigation_multiplier = 1.0
        if self.watering_frequency and self.farm.irrigation_type:
            if self.farm.irrigation_type == 'None':
                # No irrigation system, fully dependent on rainfall
                irrigation_multiplier = 0.85
            elif self.farm.irrigation_type == 'Drip':
                # Drip irrigation is efficient
                irrigation_multiplier = 1.15
            
            # Factor in watering frequency
            if self.watering_frequency == 'Daily':
                irrigation_multiplier *= 1.1  # Regular watering is good
            elif self.watering_frequency == 'As_Needed':
                irrigation_multiplier *= 0.95  # Less predictable
        
        # Calculate final predicted yield
        predicted_yield = float(self.area_planted_hectares) * base_yield_per_hectare * soil_multiplier * weather_multiplier * health_multiplier * irrigation_multiplier
        
        # Set confidence level based on available data
        confidence = 70.0  # Base confidence
        if not recent_weather.exists():
            confidence -= 15  # Lower confidence without weather data
        if not (self.farm.soil_ph and self.farm.soil_nitrogen):
            confidence -= 10  # Lower confidence without soil data
        
        # Increase confidence for detailed crop monitoring
        if self.growth_stage and self.health_status:
            confidence += 15
        if self.last_fertilized:
            confidence += 5
        
        # Growth stage affects confidence
        if self.growth_stage in ['Fruiting', 'Harvest']:
            confidence += 10  # More confidence closer to harvest
        
        # Cap confidence at 95%
        confidence = min(confidence, 95.0)
        
        # Update the model
        self.predicted_yield = round(predicted_yield, 2)
        self.yield_prediction_date = timezone.now()
        self.yield_confidence = confidence
        
        # Calculate projected revenue if planting cost is available
        if self.predicted_yield and self.crop:
            try:
                # This is simplified. In reality, you would need to get current market prices
                # for the specific crop, potentially from an external API or database
                average_price_per_ton = 500  # Example price in currency units per ton
                
                # Calculate revenue
                total_revenue = self.predicted_yield * average_price_per_ton
                self.projected_revenue = round(total_revenue, 2)
            except Exception as e:
                # Log but don't halt processing
                print(f"Error calculating projected revenue: {e}")
        
        # Save the updated fields
        update_fields = ['predicted_yield', 'yield_prediction_date', 'yield_confidence']
        if self.projected_revenue is not None:
            update_fields.append('projected_revenue')
        
        self.save(update_fields=update_fields)
        
        return self.predicted_yield

class Recommendation(models.Model):
    RECOMMENDATION_TYPES = [
        ('YIELD', 'Yield Prediction'),
        ('FERTILIZER', 'Fertilizer Usage'),
        ('WATER', 'Water Usage'),
        ('CROP', 'Crop Suggestion'),
        ('WEATHER', 'Weather Forecast Info'),
        # Add more types as needed
    ]
    farm_crop = models.ForeignKey(FarmCrop, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True)  # Link to specific planting
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True)  # Or link to the whole farm
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    details = models.JSONField()  # Flexible field to store recommendation data (values, text, etc.)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.farm_crop if self.farm_crop else self.farm
        return f"{self.get_recommendation_type_display()} for {target}"

class DetectedWeed(models.Model):
    name = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=150, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    treatment_methods = models.TextField(blank=True, null=True)
    risk_level = models.CharField(max_length=20, choices=[
        ('LOW', 'Low Risk'),
        ('MEDIUM', 'Medium Risk'),
        ('HIGH', 'High Risk'),
    ], default='MEDIUM')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Scan(models.Model):
    SCAN_TYPES = [
        ('DISEASE', 'Disease Detection'),
        ('WEED', 'Weed Detection'),
    ]
    farm_crop = models.ForeignKey(FarmCrop, on_delete=models.CASCADE, related_name='scans', null=True, blank=True)  # Link to specific planting
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='scans', null=True, blank=True)  # Or link to the whole farm
    scan_type = models.CharField(max_length=10, choices=SCAN_TYPES)
    image = models.ImageField(upload_to='scans/')  # Requires Pillow library: pip install Pillow
    detection_results = models.JSONField(blank=True, null=True)  # Store bounding boxes, classifications
    treatment_suggestion = models.TextField(blank=True, null=True)
    scanned_at = models.DateTimeField(auto_now_add=True)
    
    # For weed detection scans
    detected_weeds = models.ManyToManyField(DetectedWeed, blank=True, related_name='scans')
    weed_coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    def __str__(self):
        target = self.farm_crop if self.farm_crop else self.farm
        return f"{self.get_scan_type_display()} for {target} at {self.scanned_at}"
    
    def process_weed_detection(self):
        """Process the scan for weed detection and link to DetectedWeed objects"""
        if self.scan_type != 'WEED' or not self.detection_results:
            return False
        
        # Calculate weed coverage from detection results
        # This is a simplified example - actual implementation would depend on your detection_results structure
        total_area = 0
        weed_area = 0
        
        if isinstance(self.detection_results, dict) and 'boxes' in self.detection_results:
            total_area = self.detection_results.get('image_area', 100)
            for box in self.detection_results.get('boxes', []):
                weed_area += box.get('area', 0)
        
        if total_area > 0:
            self.weed_coverage_percentage = (weed_area / total_area) * 100
        
        # Link detected weeds
        if isinstance(self.detection_results, dict) and 'classes' in self.detection_results:
            for weed_class in self.detection_results.get('classes', []):
                weed_name = weed_class.get('name')
                if weed_name:
                    weed, created = DetectedWeed.objects.get_or_create(name=weed_name)
                    self.detected_weeds.add(weed)
        
        self.save()
        return True

class InventoryItem(models.Model):
    CATEGORY_CHOICES = [
        ('Seeds', 'Seeds'),
        ('Fertilizers', 'Fertilizers'),
        ('Pesticides', 'Pesticides'),
        ('Fuel', 'Fuel'),
        ('Parts', 'Parts'),
        ('Tools', 'Tools'),
    ]
    
    # Define unit choices for each category
    CATEGORY_UNITS = {
        'Seeds': [('kg', 'Kilograms'), ('g', 'Grams'), ('bags', 'Bags')],
        'Fertilizers': [('kg', 'Kilograms'), ('L', 'Liters'), ('bags', 'Bags')],
        'Pesticides': [('L', 'Liters'), ('ml', 'Milliliters'), ('bottles', 'Bottles')],
        'Fuel': [('L', 'Liters'), ('gal', 'Gallons')],
        'Parts': [('units', 'Units'), ('boxes', 'Boxes')],
        'Tools': [('units', 'Units'), ('sets', 'Sets')],
    }
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='units')
    low_stock_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='inventory_items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit}) - {self.farmer.profile.user.username}"
    
    @property
    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold

class Equipment(models.Model):
    STATUS_CHOICES = [
        ('Operational', 'Operational'),
        ('Maintenance Needed', 'Maintenance Needed'),
        ('Out of Service', 'Out of Service'),
    ]
    
    TYPE_CHOICES = [
        ('Tractor', 'Tractor'),
        ('Harvester', 'Harvester'),
        ('Seeder', 'Seeder'),
        ('Sprayer', 'Sprayer'),
        ('Trailer', 'Trailer'),
        ('Tillage', 'Tillage'),
        ('Other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)  # Now using predefined choices
    purchase_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Operational')
    next_maintenance = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='equipment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.type}) - {self.farmer.profile.user.username}"
    
    @property
    def needs_maintenance(self):
        return self.status == 'Maintenance Needed'
    
    def save(self, *args, **kwargs):
        # Check if next_maintenance date is passed and update status accordingly
        if self.next_maintenance and self.next_maintenance < timezone.now().date():
            self.status = 'Maintenance Needed'
        super().save(*args, **kwargs)

class CropClassification(models.Model):
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
    ]
    
    FERTILIZER_TYPE_CHOICES = [
        ('Urea', 'Urea'),
        ('DAP', 'DAP'),
        ('NPK', 'NPK'),
        ('Organic', 'Organic'),
        ('Other', 'Other'),
    ]
    
    GOVERNORATE_CHOICES = [
        ('Ariana', 'Ariana'),
        ('Beja', 'Beja'),
        ('Ben Arous', 'Ben Arous'),
        ('Bizerte', 'Bizerte'),
        ('Gabes', 'Gabes'),
        ('Gafsa', 'Gafsa'),
        ('Jendouba', 'Jendouba'),
        ('Kairouan', 'Kairouan'),
        ('Kasserine', 'Kasserine'),
        ('Kebili', 'Kebili'),
        ('Kef', 'Kef'),
        ('Mahdia', 'Mahdia'),
        ('Manouba', 'Manouba'),
        ('Medenine', 'Medenine'),
        ('Monastir', 'Monastir'),
        ('Nabeul', 'Nabeul'),
        ('Sfax', 'Sfax'),
        ('Sidi Bouzid', 'Sidi Bouzid'),
        ('Siliana', 'Siliana'),
        ('Sousse', 'Sousse'),
        ('Tataouine', 'Tataouine'),
        ('Tozeur', 'Tozeur'),
        ('Tunis', 'Tunis'),
        ('Zaghouan', 'Zaghouan'),
    ]

    # Farm and soil data
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='crop_classifications')
    soil_n = models.DecimalField('Nitrogen Level N (kg/ha)', max_digits=8, decimal_places=2)
    soil_p = models.DecimalField('Phosphorus Level P (kg/ha)', max_digits=8, decimal_places=2)
    soil_k = models.DecimalField('Potassium Level K (kg/ha)', max_digits=8, decimal_places=2)
    temperature = models.DecimalField('Temperature (°C)', max_digits=5, decimal_places=2)
    humidity = models.DecimalField('Humidity (%)', max_digits=5, decimal_places=2)
    ph = models.DecimalField('Soil pH', max_digits=4, decimal_places=2)
    rainfall = models.DecimalField('Rainfall (mm)', max_digits=6, decimal_places=2)
    area = models.DecimalField('Area (ha)', max_digits=10, decimal_places=2)

    # Inputs and methods
    fertilizer_amount = models.DecimalField('Fertilizer Amount (kg)', max_digits=8, decimal_places=2)
    pesticide_amount = models.DecimalField('Pesticide Amount (kg)', max_digits=8, decimal_places=2)
    governorate = models.CharField('Governorate', max_length=50, choices=GOVERNORATE_CHOICES)
    district = models.CharField('District', max_length=100, blank=True, null=True)
    irrigation = models.CharField('Irrigation Method', max_length=20, choices=Farm.IRRIGATION_TYPE_CHOICES)
    fertilizer_type = models.CharField('Fertilizer Type', max_length=20, choices=FERTILIZER_TYPE_CHOICES)

    # Seasons
    planting_season = models.CharField('Planting Season', max_length=20, choices=SEASON_CHOICES)
    growing_season = models.CharField('Growing Season', max_length=20, choices=SEASON_CHOICES)
    harvest_season = models.CharField('Harvest Season', max_length=20, choices=SEASON_CHOICES)

    # Results and metadata
    recommended_crop = models.ForeignKey(Crop, on_delete=models.SET_NULL, null=True, blank=True, related_name='classifications')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Crop Classification for {self.farm.name} at {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Automatically pull data from farm if not provided
        if not self.area and self.farm.size_hectares:
            self.area = self.farm.size_hectares
            
        if not self.ph and self.farm.soil_ph:
            self.ph = self.farm.soil_ph
            
        if not self.soil_n and self.farm.soil_nitrogen:
            self.soil_n = self.farm.soil_nitrogen
            
        if not self.soil_p and self.farm.soil_phosphorus:
            self.soil_p = self.farm.soil_phosphorus
            
        if not self.soil_k and self.farm.soil_potassium:
            self.soil_k = self.farm.soil_potassium
            
        if not self.irrigation and self.farm.irrigation_type:
            self.irrigation = self.farm.irrigation_type

        # Get latest weather data if available
        latest_weather = self.farm.weather_records.order_by('-date').first()
        if latest_weather:
            if not self.temperature:
                self.temperature = (latest_weather.temperature_max + latest_weather.temperature_min) / 2
            if not self.humidity and latest_weather.humidity:
                self.humidity = latest_weather.humidity
            if not self.rainfall and latest_weather.precipitation:
                self.rainfall = latest_weather.precipitation

        # Predict crop using the ML model
        try:
            import os
            from django.apps import apps
            
            # Import the ml_utils dynamically to avoid circular imports
            try:
                from api.ml_utils import predict_crop
                print("Successfully imported predict_crop from ml_utils")
            except ImportError:
                print("Error importing predict_crop, will use fallback method")
                predict_crop = None

            # Prepare data for prediction
            data = {
                'N (kg/ha)': [float(self.soil_n)],
                'P (kg/ha)': [float(self.soil_p)],
                'K (kg/ha)': [float(self.soil_k)],
                'Temperature (°C)': [float(self.temperature)],
                'Humidity (%)': [float(self.humidity)],
                'pH': [float(self.ph)],
                'Rainfall (mm)': [float(self.rainfall)],
                'Area (ha)': [float(self.area)],
                'Fertilizer (kg)': [float(self.fertilizer_amount)],
                'Pesticide (kg)': [float(self.pesticide_amount)],
                'Governorate': [self.governorate],
                'Irrigation': [self.irrigation],
                'Fertilizer Plant': [self.fertilizer_type],
                'Planting Season': [self.planting_season],
                'Growing Season': [self.growing_season],
                'Harvest Season': [self.harvest_season]
            }
            
            # Try to use the utility function first
            if predict_crop:
                predicted_crop_name, confidence = predict_crop(data)
                print(f"Prediction from utility: {predicted_crop_name}, confidence: {confidence}")
            else:
                # Fallback to local prediction if utility function not available
                import pandas as pd
                import joblib
                
                # Try both absolute and relative paths, prioritizing local copy
                model_paths = [
                    os.path.join('models', 'crop_classifier.pkl'),  # Local copy in Django project directory
                    r'C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\ml_models\crop_classifier.pkl',
                    os.path.join('..', '..', 'Models', 'ml_models', 'crop_classifier.pkl')
                ]
                
                model = None
                for path in model_paths:
                    if os.path.exists(path):
                        print(f"Loading model from: {path}")
                        model = joblib.load(path)
                        break
                
                if not model:
                    raise FileNotFoundError("Could not find the crop classification model")
                
                df_input = pd.DataFrame(data)
                predicted_crop_name = model.predict(df_input)[0]
                probabilities = model.predict_proba(df_input)[0]
                confidence = float(probabilities.max()) * 100
                print(f"Prediction from fallback: {predicted_crop_name}, confidence: {confidence}")

            # Get or create the Crop object
            recommended_crop, _ = Crop.objects.get_or_create(name=predicted_crop_name)
            self.recommended_crop = recommended_crop
            self.confidence_score = confidence

        except Exception as e:
            import logging
            import traceback
            import pandas as pd  # Ensure pandas is imported
            
            logger = logging.getLogger(__name__)
            logger.error(f"Error predicting crop: {e}")
            logger.error(f"Stack trace: {traceback.format_exc()}")
            
            # Print the error for console visibility during development
            print(f"ERROR predicting crop: {e}")
            print(f"Stack trace: {traceback.format_exc()}")
            
            # Check file paths for debugging
            print(f"Absolute model path exists: {os.path.exists(r'C:\Users\ahmed\Desktop\PIDS\Data-Farmers-FarmWise-4DS3\Models\ml_models\crop_classifier.pkl')}")
            print(f"Current working directory: {os.getcwd()}")
            
            # Use a fallback value for recommended_crop so the save doesn't fail
            default_crop, _ = Crop.objects.get_or_create(name="Wheat")  # Default to a common crop
            self.recommended_crop = default_crop
            self.confidence_score = 50.0  # Default confidence

        super().save(*args, **kwargs)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a UserProfile whenever a User is created"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile whenever a User is saved"""
    instance.profile.save()

@receiver(post_save, sender=UserProfile)
def create_role_specific_profile(sender, instance, created, **kwargs):
    """Create specific profile based on user type"""
    # Create the role-specific profile if it doesn't exist yet or if the user type has changed
    if instance.is_farmer:
        # Always ensure farmer profile exists for FARMER type
        if not hasattr(instance, 'farmer_profile'):
            Farmer.objects.create(profile=instance)
    elif instance.is_admin:
        # Always ensure admin profile exists for ADMIN type  
        if not hasattr(instance, 'admin_profile'):
            Admin.objects.create(profile=instance)
    
    # Clean up any profiles that shouldn't exist based on current user_type
    if not instance.is_farmer and hasattr(instance, 'farmer_profile'):
        instance.farmer_profile.delete()
    if not instance.is_admin and hasattr(instance, 'admin_profile'):
        instance.admin_profile.delete()

@receiver(post_save, sender=UserProfile)
def save_role_specific_profile(sender, instance, **kwargs):
    """Save role-specific profile when UserProfile is saved"""
    if instance.is_farmer and hasattr(instance, 'farmer_profile'):
        instance.farmer_profile.save()
    elif instance.is_admin and hasattr(instance, 'admin_profile'):
        instance.admin_profile.save()
