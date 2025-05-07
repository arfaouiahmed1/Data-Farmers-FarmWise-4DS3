from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'farms', views.FarmViewSet, basename='farm')
router.register(r'farmers', views.FarmerViewSet, basename='farmer')
router.register(r'admins', views.AdminViewSet, basename='admin')

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
    path('complete-onboarding/', views.complete_onboarding, name='complete-onboarding'),
    
    # Farm from onboarding data
    path('add-farm-from-onboarding/', views.add_farm_from_onboarding, name='add-farm-from-onboarding'),
    
    # Farm boundary update endpoint
    path('farms/<int:farm_id>/update-boundary/', views.update_farm_boundary, name='update-farm-boundary'),
] 