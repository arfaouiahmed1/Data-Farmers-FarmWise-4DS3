from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
# router.register(r'profiles', views.UserProfileViewSet)  # Commented out as this doesn't exist
router.register(r'farms', views.FarmViewSet, basename='farm')
router.register(r'farmers', views.FarmerViewSet, basename='farmer')
router.register(r'admins', views.AdminViewSet, basename='admin')
# router.register(r'weather', views.WeatherViewSet, basename='weather')  # Commented out as this doesn't exist
# router.register(r'crops', views.CropViewSet)  # Commented out as this doesn't exist
router.register(r'farm-crops', views.FarmCropViewSet, basename='farm-crop')
router.register(r'inventory', views.InventoryItemViewSet, basename='inventory')
router.register(r'equipment', views.EquipmentViewSet, basename='equipment')

# URL patterns for the core app
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('check-username/', views.CheckUsernameView.as_view(), name='check-username'),
    path('check-email/', views.CheckEmailView.as_view(), name='check-email'),
    
    # Profile endpoints
    path('profile/', views.profile_detail, name='profile-detail'),
    
    # Complete onboarding endpoint
    # path('complete-onboarding/', views.complete_onboarding, name='complete-onboarding'),
    
    # Farm from onboarding data
    path('add-farm-from-onboarding/', views.add_farm_from_onboarding, name='add-farm-from-onboarding'),
    
    # Enhanced onboarding with progress saving
    re_path(r'^farm/onboarding/?$', views.farm_onboarding, name='farm-onboarding'),
    
    # Farm boundary update endpoint
    path('farms/<int:farm_id>/update-boundary/', views.update_farm_boundary, name='update-farm-boundary'),
    
    # Debug onboarding endpoint
    path('debug/onboarding/', views.debug_onboarding, name='debug-onboarding'),
    
    # Add a specific endpoint for user farms
    path('user-farms/', views.user_farms, name='user-farms'),
    
    # FarmCrop classification data initialization
    path('farm-crops/<int:farm_crop_id>/initialize-classification/', views.initialize_farm_crop_classification, name='initialize-farm-crop-classification'),
    
    # Yield prediction endpoint
    path('yield-prediction/', views.yield_prediction, name='yield-prediction'),
]