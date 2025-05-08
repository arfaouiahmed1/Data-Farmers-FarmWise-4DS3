from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions, serializers
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
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not password:
            return Response({'error': 'Please provide a password'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if not username and not email:
            return Response({'error': 'Please provide either username or email'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = None
        
        # First try to authenticate with provided credentials
        if username:
            user = authenticate(username=username, password=password)
        elif email:
            # Try to find a user with this email
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
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
    # Define user_profile here so it's available to all request methods
    user_profile = request.user.profile

    print("\n===== FARM ONBOARDING DEBUG =====")
    print(f"Request method: {request.method}")
    print(f"User: {request.user.username}, Auth: {request.user.is_authenticated}")
    print(f"Has profile: {hasattr(request.user, 'profile')}")
    
    if hasattr(request.user, 'profile'):
        print(f"Profile type: {request.user.profile.user_type}")
        print(f"Is farmer: {request.user.profile.is_farmer}")
        print(f"Has farmer profile: {hasattr(request.user.profile, 'farmer_profile')}")
    
    print("================================\n")
    
    if request.method == 'POST':
        # Complete onboarding and create farm
        validation_errors = []
        
        # Get profile and ensure it has farmer_profile
        # user_profile = request.user.profile # No longer needed here, defined above
        
        # Ensure user is a farmer
        if user_profile.user_type != 'FARMER':
            user_profile.user_type = 'FARMER'
            user_profile.save()
        
        # Create farmer profile if it doesn't exist yet
        if not hasattr(user_profile, 'farmer_profile'):
            print("Creating missing farmer profile for user")
            farmer = Farmer.objects.create(profile=user_profile)
        else:
            farmer = user_profile.farmer_profile
        
        # Validate required fields
        farm_name = request.data.get('farm_name')
        if not farm_name:
            validation_errors.append("Your farm needs a name! Please tell us what to call it.")
            
        soil_type = request.data.get('soil_type')
        if not soil_type:
            validation_errors.append("Help us understand your farm better - what type of soil do you have?")
            
        irrigation_type = request.data.get('irrigation_type')
        if not irrigation_type:
            validation_errors.append("How do you water your crops? Please select an irrigation method.")
            
        farming_method = request.data.get('farming_method')
        if not farming_method:
            validation_errors.append("What's your farming style? Organic? Conventional? Your plants are curious!")
            
        # Check for both boundary and farmBoundary fields
        boundary = request.data.get('boundary')
        if not boundary:
            # Try alternative field name from frontend
            boundary = request.data.get('farmBoundary')
            
        if not boundary:
            validation_errors.append("Your farm needs boundaries! Please draw your farm on the map.")
            
        farmer_experience = request.data.get('farmer_experience')
        if not farmer_experience:
            validation_errors.append("How experienced are you as a farmer? Every bit of experience counts!")
        
        # If validation fails, return errors
        if validation_errors:
            raise serializers.ValidationError({'errors': validation_errors})
            
        # Create farm
        try:
            # Prepare farm data
            farm_data = {
                'name': farm_name,
                'owner': farmer,
                'soil_type': soil_type,
                'irrigation_type': irrigation_type,
                'farming_method': farming_method,
            }
            
            # Optional address
            if 'farm_address' in request.data:
                farm_data['address'] = request.data.get('farm_address')
                
            # Optional numeric fields
            if 'soil_nitrogen' in request.data:
                farm_data['soil_nitrogen'] = request.data.get('soil_nitrogen')
                
            if 'soil_phosphorus' in request.data:
                farm_data['soil_phosphorus'] = request.data.get('soil_phosphorus')
                
            if 'soil_potassium' in request.data:
                farm_data['soil_potassium'] = request.data.get('soil_potassium')
                
            if 'soil_ph' in request.data:
                farm_data['soil_ph'] = request.data.get('soil_ph')
                
            # Boolean fields
            farm_data['has_water_access'] = request.data.get('has_water_access', False)
            farm_data['has_road_access'] = request.data.get('has_road_access', False)
            farm_data['has_electricity'] = request.data.get('has_electricity', False)
            
            # Optional numeric fields
            if 'storage_capacity' in request.data:
                farm_data['storage_capacity'] = request.data.get('storage_capacity')
                
            if 'year_established' in request.data:
                farm_data['year_established'] = request.data.get('year_established')
                
            # Handle farm boundary geojson if provided
            if boundary:
                farm_data['boundary_geojson'] = boundary
                # If area_hectares is in the properties, extract it
                if isinstance(boundary, dict) and boundary.get('properties', {}).get('area_hectares'):
                    farm_data['size_hectares'] = boundary['properties']['area_hectares']
                    
                    # Set size category based on area
                    if farm_data['size_hectares'] < 10:
                        farm_data['size_category'] = 'S'  # Small
                    elif farm_data['size_hectares'] < 50:
                        farm_data['size_category'] = 'M'  # Medium
                    else:
                        farm_data['size_category'] = 'L'  # Large
            
            # Create the farm
            farm = Farm.objects.create(**farm_data)
            
            # Mark onboarding as completed
            user_profile.onboarding_completed = True
            user_profile.save()
            
            return Response({
                'success': True,
                'message': 'Farm onboarding completed successfully',
                'farm_id': farm.id
            })
        except Exception as e:
            print(f"Error creating farm: {str(e)}")
            return Response({
                'error': f'Error creating farm: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'GET':
        # Retrieve saved onboarding progress
        # from .models import UserProfile # Import is at the top
        
        try:
            # user_profile = request.user.profile # No longer needed here, defined above
            # Check if there's saved progress
            if hasattr(user_profile, 'onboarding_progress') and user_profile.onboarding_progress:
                return Response({
                    "success": True,
                    "has_saved_progress": True,
                    "progress": user_profile.onboarding_progress
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
            # user_profile = request.user.profile # No longer needed here, defined above
            progress_data = request.data
            
            # Save the progress to the user profile
            user_profile.onboarding_progress = progress_data
            user_profile.save(update_fields=['onboarding_progress'])
            
            return Response({
                "success": True,
                "message": "Progress saved successfully"
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([AllowAny])  # Making it accessible for debugging
def debug_onboarding(request):
    """
    Debug view to log all details about an onboarding request
    """
    print("\n\n===== DEBUG ONBOARDING =====")
    print(f"Request method: {request.method}")
    print(f"User: {request.user}")
    print(f"Is authenticated: {request.user.is_authenticated}")
    
    if request.user.is_authenticated:
        print(f"Username: {request.user.username}")
        print(f"Has profile: {hasattr(request.user, 'profile')}")
        if hasattr(request.user, 'profile'):
            profile = request.user.profile
            print(f"User type: {profile.user_type}")
            print(f"Is farmer: {profile.is_farmer}")
            print(f"Has farmer profile: {hasattr(profile, 'farmer_profile')}")
            if hasattr(profile, 'farmer_profile'):
                print(f"Farmer ID: {profile.farmer_profile.id}")
    
    print("\nRequest data:")
    for key, value in request.data.items():
        if key in ['boundary', 'farmBoundary']:
            print(f"{key}: [GeoJSON data]")
        else:
            print(f"{key}: {value}")
    
    print("\nRequest headers:")
    for header, value in request.headers.items():
        if header.lower() == 'authorization':
            print(f"{header}: [HIDDEN]")
        else:
            print(f"{header}: {value}")
    
    print("===========================\n\n")
    
    # Create a test farm
    if request.user.is_authenticated and hasattr(request.user, 'profile'):
        profile = request.user.profile
        
        # Ensure user is a farmer
        if profile.user_type != 'FARMER':
            profile.user_type = 'FARMER'
            profile.save()
        
        # Ensure farmer profile exists
        if not hasattr(profile, 'farmer_profile'):
            from .models import Farmer
            farmer = Farmer.objects.create(profile=profile)
        else:
            farmer = profile.farmer_profile
        
        # Create test farm
        try:
            from .models import Farm
            farm_name = request.data.get('farm_name', 'Debug Test Farm')
            
            # Check if a farm with this name already exists
            existing_farm = Farm.objects.filter(owner=farmer, name=farm_name).first()
            if not existing_farm:
                new_farm = Farm.objects.create(
                    name=farm_name,
                    owner=farmer,
                    soil_type=request.data.get('soil_type', 'Loamy'),
                    irrigation_type=request.data.get('irrigation_type', 'Drip'),
                    farming_method=request.data.get('farming_method', 'Organic'),
                    has_water_access=request.data.get('has_water_access', True),
                    has_road_access=request.data.get('has_road_access', True),
                    has_electricity=request.data.get('has_electricity', True),
                )
                
                # Mark onboarding as completed
                profile.onboarding_completed = True
                profile.save()
                
                print(f"Created test farm: {new_farm.name} (ID: {new_farm.id})")
                
                return Response({
                    'success': True,
                    'message': 'Debug farm created successfully',
                    'farm_id': new_farm.id,
                    'farm_name': new_farm.name
                })
            else:
                print(f"Farm already exists: {existing_farm.name} (ID: {existing_farm.id})")
                return Response({
                    'success': True,
                    'message': 'Farm already exists',
                    'farm_id': existing_farm.id,
                    'farm_name': existing_farm.name
                })
        except Exception as e:
            print(f"Error creating test farm: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': True,
        'message': 'Debug information logged to server console',
        'authenticated': request.user.is_authenticated
    })
