from django.contrib import admin
from .models import UserProfile, Farm, Farmer, Admin, DetectedWeed, Weather, Crop, FarmCrop, Scan, Recommendation

# Register the UserProfile model
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone_number', 'date_joined', 'onboarding_completed']
    search_fields = ['user__username', 'user__email', 'phone_number']
    list_filter = ['user_type', 'onboarding_completed']

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['profile', 'farming_experience_years', 'specialization', 'certification']
    search_fields = ['profile__user__username', 'profile__user__email', 'specialization']
    list_filter = ['farming_experience_years', 'specialization']

@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ['profile', 'role', 'department', 'is_super_admin']
    list_filter = ['is_super_admin', 'department']

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'size_hectares', 'soil_ph', 'estimated_price', 'created_at']
    list_filter = ['created_at', 'size_category']
    search_fields = ['name', 'owner__profile__user__username', 'address']

@admin.register(Weather)
class WeatherAdmin(admin.ModelAdmin):
    list_display = ['farm', 'date', 'condition', 'temperature_max', 'temperature_min', 'precipitation']
    list_filter = ['condition', 'date']
    search_fields = ['farm__name']
    date_hierarchy = 'date'

@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(FarmCrop)
class FarmCropAdmin(admin.ModelAdmin):
    list_display = ['crop', 'farm', 'planting_date', 'expected_harvest_date', 'area_planted_hectares', 'predicted_yield']
    list_filter = ['planting_date', 'expected_harvest_date']
    search_fields = ['crop__name', 'farm__name']
    date_hierarchy = 'planting_date'

@admin.register(DetectedWeed)
class DetectedWeedAdmin(admin.ModelAdmin):
    list_display = ['name', 'scientific_name', 'risk_level', 'created_at']
    list_filter = ['risk_level']
    search_fields = ['name', 'scientific_name']

@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ['scan_type', 'farm', 'farm_crop', 'scanned_at', 'weed_coverage_percentage']
    list_filter = ['scan_type', 'scanned_at']
    search_fields = ['farm__name', 'farm_crop__crop__name']
    date_hierarchy = 'scanned_at'

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ['recommendation_type', 'farm', 'farm_crop', 'generated_at']
    list_filter = ['recommendation_type', 'generated_at']
    search_fields = ['farm__name', 'farm_crop__crop__name']
    date_hierarchy = 'generated_at'
