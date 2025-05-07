from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer

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
                'token': token.key
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
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
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
            for field in ['phone_number', 'address', 'bio', 'user_type']:
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
            
            # Return updated user data
            return Response(UserSerializer(user).data)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
