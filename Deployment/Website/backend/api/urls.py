from django.urls import path
from . import views
from .views import DetectDiseaseView, TreatmentChatView

# Define your API URLs here
urlpatterns = [
    # Example: path('some-endpoint/', views.some_view, name='some-view'),
    path('segment-map/', views.SegmentMapView.as_view(), name='segment_map_api'),
    path('detect-farm-boundaries/', views.detect_farm_boundaries_view, name='detect_farm_boundaries'),
    path('detect-weeds/', views.detect_weeds_view, name='detect_weeds'),
    path('detect-disease/', DetectDiseaseView.as_view(), name='detect_disease'),
    path('chat-treatment/', TreatmentChatView.as_view(), name='chat_treatment_api'),
    path('chat-treatment', TreatmentChatView.as_view(), name='chat_treatment_api_no_slash'),
]
