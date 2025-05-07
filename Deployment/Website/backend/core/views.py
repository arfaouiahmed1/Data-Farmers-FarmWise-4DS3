from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import UserProfile, Farm, Farmer, Admin
from .serializers import UserSerializer, UserProfileSerializer, FarmSerializer, FarmerSerializer, AdminSerializer

# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'onboarding_required': True  # Always true for new users
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({'error': 'Invalid credentials'}, 
                            status=status.HTTP_401_UNAUTHORIZED)
        
        token, created = Token.objects.get_or_create(user=user)
        
        # Ensure user profile exists
        if not hasattr(user, 'profile'):
            from .models import UserProfile
            UserProfile.objects.create(user=user)
        
        # Check if user has completed onboarding
        onboarding_completed = user.profile.onboarding_completed
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        # Validate that profile data is included
        if 'profile' not in user_data or user_data['profile'] is None:
            # Manually include profile data
            from .serializers import UserProfileSerializer
            user_data['profile'] = UserProfileSerializer(user.profile).data
        
        return Response({
            'user': user_data,
            'token': token.key,
            'onboarding_required': not onboarding_completed
        })

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Please provide an email address'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            # Generate a temporary password
            temp_password = get_random_string(length=12)
            user.set_password(temp_password)
            user.save()
            
            # Send email with temporary password
            subject = 'FarmWise Password Reset'
            message = f'Your temporary password is: {temp_password}\nPlease change it after logging in.'
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            try:
                send_mail(subject, message, from_email, recipient_list)
                return Response({'success': 'A temporary password has been sent to your email'}, 
                                status=status.HTTP_200_OK)
            except Exception as e:
                user.set_password(None)  # Reset to previous state on email failure
                user.save()
                return Response({'error': 'Failed to send email. Please try again later.'}, 
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # Still return success to prevent email enumeration
            return Response({'success': 'If your email exists in our system, you will receive a reset link'}, 
                            status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({'error': 'Please provide both current and new password'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Create new token (invalidate old ones)
        Token.objects.filter(user=user).delete()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'success': 'Password changed successfully',
            'token': token.key
        }, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Regular users can only see themselves
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(pk=user.pk)

class FarmerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for farmers
    """
    serializer_class = FarmerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.profile.is_admin or user.is_staff:
            return Farmer.objects.all()
        elif user.profile.is_farmer and hasattr(user.profile, 'farmer_profile'):
            return Farmer.objects.filter(profile=user.profile)
        return Farmer.objects.none()

class AdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint for admins
    """
    serializer_class = AdminSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or (user.profile.is_admin and user.profile.admin_profile.is_super_admin):
            return Admin.objects.all()
        elif user.profile.is_admin and hasattr(user.profile, 'admin_profile'):
            return Admin.objects.filter(profile=user.profile)
        return Admin.objects.none()

class FarmViewSet(viewsets.ModelViewSet):
    """
    API endpoint for farms
    """
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        This view should return:
        - All farms for admins
        - Only owned farms for farmers
        """
        user = self.request.user
        profile = user.profile
        
        if profile.is_admin or user.is_staff:
            return Farm.objects.all()
        
        # Regular farmers can only see their own farms
        if profile.is_farmer and hasattr(profile, 'farmer_profile'):
            return Farm.objects.filter(owner=profile.farmer_profile)
        
        return Farm.objects.none()
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if user is a farmer
        if not request.user.profile.is_farmer or not hasattr(request.user.profile, 'farmer_profile'):
            return Response(
                {"error": "Only farmers can create farms"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Add owner to the farm
        farm = serializer.save(owner=request.user.profile.farmer_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def update(self, request, *args, **kwargs):
        farm = self.get_object()
        
        # Only the owner or admin can update a farm
        is_owner = hasattr(request.user.profile, 'farmer_profile') and farm.owner == request.user.profile.farmer_profile
        is_admin = request.user.profile.is_admin or request.user.is_staff
        
        if not is_owner and not is_admin:
            return Response(
                {"error": "You don't have permission to update this farm"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().update(request, *args, **kwargs)
        
    def destroy(self, request, *args, **kwargs):
        farm = self.get_object()
        
        # Only the owner or admin can delete a farm
        is_owner = hasattr(request.user.profile, 'farmer_profile') and farm.owner == request.user.profile.farmer_profile
        is_admin = request.user.profile.is_admin or request.user.is_staff
        
        if not is_owner and not is_admin:
            return Response(
                {"error": "You don't have permission to delete this farm"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().destroy(request, *args, **kwargs)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_detail(request):
    """
    Get or update the authenticated user's profile
    """
    try:
        user = request.user
        profile = user.profile
        
        if request.method == 'GET':
            serializer = UserSerializer(user)
            return Response(serializer.data)
            
        elif request.method == 'PUT':
            # Handle user fields
            user_data = {}
            for field in ['first_name', 'last_name', 'email']:
                if field in request.data:
                    user_data[field] = request.data[field]
            
            if user_data:
                user_serializer = UserSerializer(user, data=user_data, partial=True)
                if user_serializer.is_valid():
                    user_serializer.save()
                else:
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle profile fields
            profile_data = {}
            for field in ['phone_number', 'address', 'bio', 'user_type', 'onboarding_completed']:
                if field in request.data:
                    profile_data[field] = request.data[field]
            
            if 'profile_image' in request.FILES:
                profile_data['profile_image'] = request.FILES['profile_image']
            
            if profile_data:
                profile_serializer = UserProfileSerializer(profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
                else:
                    return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle farmer-specific fields
            if profile.is_farmer and hasattr(profile, 'farmer_profile') and 'farmer_data' in request.data:
                farmer_data = request.data['farmer_data']
                farmer_serializer = FarmerSerializer(profile.farmer_profile, data=farmer_data, partial=True)
                if farmer_serializer.is_valid():
                    farmer_serializer.save()
                else:
                    return Response(farmer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle admin-specific fields
            if profile.is_admin and hasattr(profile, 'admin_profile') and 'admin_data' in request.data:
                admin_data = request.data['admin_data']
                admin_serializer = AdminSerializer(profile.admin_profile, data=admin_data, partial=True)
                if admin_serializer.is_valid():
                    admin_serializer.save()
                else:
                    return Response(admin_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Return updated user data
            return Response(UserSerializer(user).data)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def complete_onboarding(request):
    """
    Mark user's onboarding as completed
    """
    try:
        user = request.user
        profile = user.profile
        
        profile.onboarding_completed = True
        profile.save()
        
        return Response({
            'success': True,
            'message': 'Onboarding marked as completed'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_farm_from_onboarding(request):
    """
    Add a new farm when user completes onboarding
    """
    try:
        # Check if user is a farmer
        if not request.user.profile.is_farmer or not hasattr(request.user.profile, 'farmer_profile'):
            return Response(
                {"error": "Only farmers can create farms"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create farm with onboarding data - farm_type has been removed from the model
        serializer = FarmSerializer(data={
            'name': request.data.get('farm_name', 'My Farm'),
            'address': request.data.get('farm_address'),
            'boundary_geojson': request.data.get('boundary'),
            'size_hectares': request.data.get('size_hectares')
        })
        
        if serializer.is_valid():
            farm = serializer.save(owner=request.user.profile.farmer_profile)
            
            # Mark onboarding as completed
            profile = request.user.profile
            profile.onboarding_completed = True
            profile.save()
            
            return Response({
                'success': True,
                'message': 'Farm created successfully',
                'farm': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
