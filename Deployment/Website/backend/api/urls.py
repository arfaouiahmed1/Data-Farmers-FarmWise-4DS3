from django.urls import path
from . import views

# Define your API URLs here
urlpatterns = [
    # Example: path('some-endpoint/', views.some_view, name='some-view'),
    path('segment-map/', views.SegmentMapView.as_view(), name='segment_map_api'),
    path('detect-farm-boundaries/', views.detect_farm_boundaries_view, name='detect_farm_boundaries'),
]
