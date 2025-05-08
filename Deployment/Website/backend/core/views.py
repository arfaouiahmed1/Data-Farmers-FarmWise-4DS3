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

class CheckUsernameView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        
        if not username:
            return Response({'error': 'Please provide a username'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(username=username).exists()
        
        return Response({
            'exists': exists
        }, status=status.HTTP_200_OK)

class CheckEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Please provide an email'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(email=email).exists()
        is_valid = '@' in email and '.' in email.split('@')[1]
        
        return Response({
            'exists': exists,
            'is_valid': is_valid
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
        
        # Create farm with onboarding data
        serializer = FarmSerializer(data={
            'name': request.data.get('farm_name', 'My Farm'),
            'address': request.data.get('farm_address'),
            'boundary_geojson': request.data.get('boundary'),
            'size_hectares': request.data.get('size_hectares'),
            'soil_type': request.data.get('soil_type'),
            'irrigation_type': request.data.get('irrigation_type'),
            'farming_method': request.data.get('farming_method'),
            'has_water_access': request.data.get('has_water_access', False),
            'year_established': request.data.get('year_established'),
            'has_road_access': request.data.get('has_road_access', False),
            'has_electricity': request.data.get('has_electricity', False),
            'storage_capacity': request.data.get('storage_capacity'),
            # Add soil nutrient data fields
            'soil_nitrogen': request.data.get('soil_nitrogen'),
            'soil_phosphorus': request.data.get('soil_phosphorus'),
            'soil_potassium': request.data.get('soil_potassium'),
            'soil_ph': request.data.get('soil_ph'),
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

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_farm_boundary(request, farm_id):
    """
    Update a farm's boundary GeoJSON data
    """
    try:
        # Get the farm
        farm = get_object_or_404(Farm, id=farm_id)
        
        # Check permissions - only owner or admin can update
        is_owner = hasattr(request.user.profile, 'farmer_profile') and farm.owner == request.user.profile.farmer_profile
        is_admin = request.user.profile.is_admin or request.user.is_staff
        
        if not is_owner and not is_admin:
            return Response(
                {"error": "You don't have permission to update this farm"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update only the boundary_geojson field
        if 'boundary_geojson' in request.data:
            farm.boundary_geojson = request.data['boundary_geojson']
            farm.save(update_fields=['boundary_geojson'])
            
            # Update farm size if GeoJSON contains area information
            if farm.boundary_geojson and 'properties' in farm.boundary_geojson and 'area_hectares' in farm.boundary_geojson['properties']:
                farm.size_hectares = farm.boundary_geojson['properties']['area_hectares']
                farm.save(update_fields=['size_hectares'])
            
            return Response({
                "success": True,
                "message": "Farm boundary updated successfully"
            })
        else:
            return Response({
                "error": "No boundary_geojson data provided"
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST', 'GET', 'PUT'])
@permission_classes([IsAuthenticated])
def farm_onboarding(request):
    """
    Handle farm onboarding process with save/resume support
    
    POST: Submit complete farm onboarding data
    GET: Retrieve saved onboarding progress
    PUT: Save partial onboarding progress
    """
    user = request.user
    profile = user.profile
    
    # Check if user is a farmer
    if not profile.is_farmer or not hasattr(profile, 'farmer_profile'):
        return Response(
            {"error": "Only farmers can complete farm onboarding"},
            status=status.HTTP_403_FORBIDDEN
        )
        
    if request.method == 'POST':
        # Complete onboarding and create farm
        validation_errors = []
        
        # Validate required fields
        farm_name = request.data.get('farm_name')
        if not farm_name or not farm_name.strip():
            validation_errors.append("Your farm needs a name to grow! Please give it one.")
            
        farm_address = request.data.get('farm_address')
        if not farm_address or not farm_address.strip():
            validation_errors.append("Where's your farm located? We need an address.")
            
        soil_type = request.data.get('soil_type')
        if not soil_type:
            validation_errors.append("Your crops want to know what soil they'll be growing in!")
            
        irrigation_type = request.data.get('irrigation_type')
        if not irrigation_type:
            validation_errors.append("How will you water your plants? Please select an irrigation method.")
            
        farming_method = request.data.get('farming_method')
        if not farming_method:
            validation_errors.append("What's your farming style? Organic? Conventional? Your plants are curious!")
            
        boundary = request.data.get('boundary')
        if not boundary:
            validation_errors.append("Your farm needs boundaries! Please draw your farm on the map.")
            
        farmer_experience = request.data.get('farmer_experience')
        if not farmer_experience:
            validation_errors.append("Are you new to farming or a seasoned pro? We'd love to know!")
            
        # Validate soil nutrient data if provided
        soil_nitrogen = request.data.get('soil_nitrogen')
        soil_phosphorus = request.data.get('soil_phosphorus')
        soil_potassium = request.data.get('soil_potassium')
        soil_ph = request.data.get('soil_ph')
        
        if soil_nitrogen is not None:
            try:
                n_value = float(soil_nitrogen)
                if n_value < 0:
                    validation_errors.append("Nitrogen can't be negative. What would your plants eat?")
                elif n_value > 150:
                    validation_errors.append("That's super-charged nitrogen! A bit too high for soil.")
            except (ValueError, TypeError):
                validation_errors.append("Nitrogen level should be a valid number.")
                
        if soil_phosphorus is not None:
            try:
                p_value = float(soil_phosphorus)
                if p_value < 0:
                    validation_errors.append("Phosphorus can't be negative. Your plants would be puzzled!")
                elif p_value > 100:
                    validation_errors.append("That's rocket-fuel phosphorus levels! A bit too high.")
            except (ValueError, TypeError):
                validation_errors.append("Phosphorus level should be a valid number.")
                
        if soil_potassium is not None:
            try:
                k_value = float(soil_potassium)
                if k_value < 0:
                    validation_errors.append("Potassium can't be negative. Your plants would be confused!")
                elif k_value > 300:
                    validation_errors.append("That's banana-level potassium! A bit too high for soil.")
            except (ValueError, TypeError):
                validation_errors.append("Potassium level should be a valid number.")
                
        if soil_ph is not None:
            try:
                ph_value = float(soil_ph)
                if ph_value < 0:
                    validation_errors.append("pH below 0? That's not soil, that's science fiction!")
                elif ph_value > 14:
                    validation_errors.append("pH can't exceed 14 - that's beyond the pH scale entirely!")
            except (ValueError, TypeError):
                validation_errors.append("pH should be a valid number between 0 and 14.")
        
        # Return validation errors if any
        if validation_errors:
            return Response({
                "error": "Validation failed",
                "details": validation_errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create farm with onboarding data
            from .models import Farm
            
            # Process size from boundary if available
            size_hectares = None
            if boundary and 'properties' in boundary and 'area_hectares' in boundary['properties']:
                size_hectares = boundary['properties']['area_hectares']
            
            farm = Farm.objects.create(
                name=farm_name.strip(),
                owner=profile.farmer_profile,
                address=farm_address.strip(),
                boundary_geojson=boundary,
                size_hectares=size_hectares,
                soil_type=soil_type,
                irrigation_type=irrigation_type,
                farming_method=farming_method,
                has_water_access=request.data.get('has_water_access', False),
                has_road_access=request.data.get('has_road_access', False),
                has_electricity=request.data.get('has_electricity', False),
                storage_capacity=request.data.get('storage_capacity'),
                year_established=request.data.get('year_established'),
                soil_nitrogen=soil_nitrogen,
                soil_phosphorus=soil_phosphorus,
                soil_potassium=soil_potassium,
                soil_ph=soil_ph
            )
            
            # Update farmer experience if provided
            if farmer_experience:
                farmer = profile.farmer_profile
                
                if farmer_experience == 'new':
                    farmer.farming_experience_years = 0
                elif farmer_experience == 'experienced':
                    # Default to 5 years for experienced farmers
                    farmer.farming_experience_years = 5
                
                farmer.save(update_fields=['farming_experience_years'])
            
            # Mark onboarding as completed
            profile.onboarding_completed = True
            profile.save(update_fields=['onboarding_completed'])
            
            # Clear any saved progress data
            if hasattr(profile, 'onboarding_progress'):
                profile.onboarding_progress = None
                profile.save(update_fields=['onboarding_progress'])
            
            # Calculate and update estimated price
            farm.calculate_estimated_price()
            
            return Response({
                "success": True,
                "message": "Congratulations! Your farm has been set up successfully.",
                "farm_id": farm.id
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'GET':
        # Retrieve saved onboarding progress
        from .models import UserProfile
        
        try:
            # Check if there's saved progress
            if hasattr(profile, 'onboarding_progress') and profile.onboarding_progress:
                return Response({
                    "success": True,
                    "has_saved_progress": True,
                    "progress": profile.onboarding_progress
                })
            else:
                return Response({
                    "success": True,
                    "has_saved_progress": False
                })
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    elif request.method == 'PUT':
        # Save partial onboarding progress
        try:
            progress_data = request.data
            
            # Save the progress to the user profile
            profile.onboarding_progress = progress_data
            profile.save(update_fields=['onboarding_progress'])
            
            return Response({
                "success": True,
                "message": "Progress saved successfully"
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
