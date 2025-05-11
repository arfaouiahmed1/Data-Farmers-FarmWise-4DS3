from rest_framework import serializers
from core.models import CropClassification, Farm, Crop

class CropClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropClassification
        fields = [
            'id', 'farm', 'soil_n', 'soil_p', 'soil_k', 'temperature', 
            'humidity', 'ph', 'rainfall', 'area', 'fertilizer_amount',
            'pesticide_amount', 'governorate', 'district', 'irrigation',
            'fertilizer_type', 'planting_season', 'growing_season',
            'harvest_season', 'recommended_crop', 'confidence_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['recommended_crop', 'confidence_score', 'created_at', 'updated_at']
