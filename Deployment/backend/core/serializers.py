from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Farm, Farmer, Admin, Weather, DetectedWeed, Crop, FarmCrop, Scan, Recommendation, InventoryItem, Equipment, CropClassification

class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ['id', 'name', 'address', 'description', 'size_hectares', 'size_category',
                  'soil_type', 'soil_nitrogen', 'soil_phosphorus', 'soil_potassium', 'soil_ph',
                  'has_water_access', 'irrigation_type', 'has_road_access', 'has_electricity', 
                  'storage_capacity', 'farming_method', 'year_established',
                  'estimated_price', 'boundary_geojson', 'created_at', 'updated_at', 'owner']
        read_only_fields = ['created_at', 'updated_at', 'owner']
    
    def validate_boundary_geojson(self, value):
        """
        Validate the GeoJSON boundary data.
        This allows complex GeoJSON objects to be passed in without validation errors.
        """
        if value is None:
            return value
            
        # For a basic check, ensure it has type and geometry at minimum
        if isinstance(value, dict):
            if 'type' not in value and 'geometry' not in value and 'coordinates' not in value:
                raise serializers.ValidationError("Invalid GeoJSON format")
        return value
    
    def create(self, validated_data):
        # Get the farmer profile from the request or context
        try:
            if 'request' in self.context:
                user_profile = self.context['request'].user.profile
                
                if hasattr(user_profile, 'farmer_profile'):
                    farmer = user_profile.farmer_profile
                    farm = Farm.objects.create(owner=farmer, **validated_data)
                    return farm
                else:
                    raise serializers.ValidationError("Only farmers can create farms")
            else:
                # If being called from a different context (like add_farm_from_onboarding)
                # where the owner is passed directly in validated_data
                return Farm.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Error creating farm: {str(e)}")

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = '__all__'

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'

class FarmCropSerializer(serializers.ModelSerializer):
    crop_name = serializers.CharField(source='crop.name', read_only=True)
    
    class Meta:
        model = FarmCrop
        fields = ['id', 'farm', 'crop', 'crop_name', 'planting_date', 'expected_harvest_date', 
                  'area_planted_hectares', 'growth_stage', 'health_status', 'notes', 
                  'last_fertilized', 'watering_frequency', 'planting_cost', 
                  'expected_yield_per_hectare', 'projected_revenue',
                  'predicted_yield', 'yield_confidence', 'yield_prediction_date']
        
class DetectedWeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectedWeed
        fields = '__all__'

class ScanSerializer(serializers.ModelSerializer):
    detected_weeds = DetectedWeedSerializer(many=True, read_only=True)
    
    class Meta:
        model = Scan
        fields = ['id', 'farm', 'farm_crop', 'scan_type', 'image', 'detection_results', 
                  'treatment_suggestion', 'scanned_at', 'detected_weeds', 'weed_coverage_percentage']
        
class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'category', 'quantity', 'unit', 'low_stock_threshold', 
                 'farmer', 'is_low_stock', 'created_at', 'updated_at']

class EquipmentSerializer(serializers.ModelSerializer):
    needs_maintenance = serializers.ReadOnlyField()
    purchase_date = serializers.DateField(format="%Y-%m-%d", input_formats=['%Y-%m-%d', 'iso-8601'], allow_null=True)
    next_maintenance = serializers.DateField(format="%Y-%m-%d", input_formats=['%Y-%m-%d', 'iso-8601'], allow_null=True)
    
    class Meta:
        model = Equipment
        fields = ['id', 'name', 'type', 'purchase_date', 'status', 'next_maintenance', 
                  'notes', 'farmer', 'needs_maintenance', 'created_at', 'updated_at']

class FarmerSerializer(serializers.ModelSerializer):
    farms = FarmSerializer(many=True, read_only=True)
    inventory_items = InventoryItemSerializer(many=True, read_only=True)
    equipment = EquipmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Farmer
        fields = ['id', 'farming_experience_years', 'specialization', 'certification',
                 'equipment_owned', 'preferred_crops', 'farms', 'inventory_items', 'equipment']

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['id', 'role', 'department', 'permissions_level', 'is_super_admin']

class UserProfileSerializer(serializers.ModelSerializer):
    farmer_data = serializers.SerializerMethodField()
    admin_data = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user_type', 'phone_number', 'address', 'profile_image', 
                 'bio', 'date_joined', 'last_updated', 'onboarding_completed', 
                 'farmer_data', 'admin_data']
    
    def get_farmer_data(self, obj):
        if obj.is_farmer and hasattr(obj, 'farmer_profile'):
            return FarmerSerializer(obj.farmer_profile).data
        return None
    
    def get_admin_data(self, obj):
        if obj.is_admin and hasattr(obj, 'admin_profile'):
            return AdminSerializer(obj.admin_profile).data
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile', 'date_joined', 'is_active']
        read_only_fields = ['date_joined', 'is_active']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)

class CropClassificationSerializer(serializers.ModelSerializer):
    recommended_crop = serializers.SerializerMethodField()

    class Meta:
        model = CropClassification
        fields = '__all__'
        
    def get_recommended_crop(self, obj):
        if obj.recommended_crop:
            return {
                'id': obj.recommended_crop.id,
                'name': obj.recommended_crop.name
            }
        return None