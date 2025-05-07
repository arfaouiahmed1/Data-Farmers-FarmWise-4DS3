from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'users', views.UserViewSet)

# URL patterns for the core app
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    # Profile endpoints
    path('profile/', views.profile_detail, name='profile'),
] 