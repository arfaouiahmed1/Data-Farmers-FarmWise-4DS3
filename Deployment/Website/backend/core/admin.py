from django.contrib import admin
from .models import UserProfile

# Register the UserProfile model
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone_number']
    search_fields = ['user__username', 'user__email', 'phone_number']
    list_filter = ['user_type', 'date_joined']
