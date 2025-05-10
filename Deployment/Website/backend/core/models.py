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
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    # Add other relevant fields like optimal conditions, etc.

    def __str__(self):
        return self.name

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
    
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='farm_crops')
    crop = models.ForeignKey(Crop, on_delete=models.PROTECT, related_name='crop_plantings')  # Protect Crop from deletion if used
    planting_date = models.DateField(blank=True, null=True)
    expected_harvest_date = models.DateField(blank=True, null=True)
    area_planted_hectares = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
