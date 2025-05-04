from django.db import models
from django.contrib.auth.models import User # Import Django's built-in User model

# Create your models here.

class Farm(models.Model):
    FARM_SIZE_CHOICES = [
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
    ]
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    name = models.CharField(max_length=255)
    location_address = models.TextField(blank=True, null=True) # Optional text address
    boundary_geojson = models.JSONField(blank=True, null=True) # Store GeoJSON data for boundary
    size_category = models.CharField(max_length=1, choices=FARM_SIZE_CHOICES, blank=True, null=True) # Can be derived or set
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"

class Crop(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    # Add other relevant fields like optimal conditions, etc.

    def __str__(self):
        return self.name

class FarmCrop(models.Model):
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='farm_crops')
    crop = models.ForeignKey(Crop, on_delete=models.PROTECT, related_name='crop_plantings') # Protect Crop from deletion if used
    planting_date = models.DateField(blank=True, null=True)
    expected_harvest_date = models.DateField(blank=True, null=True)
    area_planted_hectares = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.crop.name} on {self.farm.name}"

class Recommendation(models.Model):
    RECOMMENDATION_TYPES = [
        ('YIELD', 'Yield Prediction'),
        ('FERTILIZER', 'Fertilizer Usage'),
        ('WATER', 'Water Usage'),
        ('CROP', 'Crop Suggestion'),
        ('WEATHER', 'Weather Forecast Info'),
        # Add more types as needed
    ]
    farm_crop = models.ForeignKey(FarmCrop, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True) # Link to specific planting
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='recommendations', null=True, blank=True) # Or link to the whole farm
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    details = models.JSONField() # Flexible field to store recommendation data (values, text, etc.)
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.farm_crop if self.farm_crop else self.farm
        return f"{self.get_recommendation_type_display()} for {target}"

class Scan(models.Model):
    SCAN_TYPES = [
        ('DISEASE', 'Disease Detection'),
        ('WEED', 'Weed Detection'),
    ]
    farm_crop = models.ForeignKey(FarmCrop, on_delete=models.CASCADE, related_name='scans', null=True, blank=True) # Link to specific planting
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='scans', null=True, blank=True) # Or link to the whole farm
    scan_type = models.CharField(max_length=10, choices=SCAN_TYPES)
    image = models.ImageField(upload_to='scans/') # Requires Pillow library: pip install Pillow
    detection_results = models.JSONField(blank=True, null=True) # Store bounding boxes, classifications
    treatment_suggestion = models.TextField(blank=True, null=True)
    scanned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.farm_crop if self.farm_crop else self.farm
        return f"{self.get_scan_type_display()} for {target} at {self.scanned_at}"

# Consider adding a UserProfile model if you need more fields than Django's User offers
# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
#     # Add extra fields like phone_number, address, etc.
#     def __str__(self):
#         return self.user.username
