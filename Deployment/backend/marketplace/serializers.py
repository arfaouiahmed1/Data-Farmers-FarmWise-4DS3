from rest_framework import serializers
from .models import ProductCategory, Product, Order
from django.contrib.auth.models import User

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name') # Add other fields as needed, e.g., email

class ProductSerializer(serializers.ModelSerializer):
    seller = ProductUserSerializer(read_only=True) # Display seller info, but don't allow update via product endpoint directly
    seller_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='seller', write_only=True
    )
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'category', 'category_name', 'price', 
            'seller', 'seller_id', 'image_url', 'location_text', 'quantity', 'unit',
            'date_posted', 'is_active'
        )
        read_only_fields = ('date_posted',)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be positive.")
        return value

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

class OrderSerializer(serializers.ModelSerializer):
    buyer = ProductUserSerializer(read_only=True) # Similar to Product seller
    buyer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='buyer', write_only=True
    )
    product_details = ProductSerializer(source='product', read_only=True) # Show product details

    class Meta:
        model = Order
        fields = (
            'id', 'buyer', 'buyer_id', 'product', 'product_details', 'quantity_ordered', 
            'total_price', 'order_date', 'status', 'shipping_address', 'contact_phone'
        )
        read_only_fields = ('order_date', 'total_price') # total_price should be calculated in the view or model

    def validate_quantity_ordered(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity ordered must be positive.")
        return value

    # Additional validation: ensure quantity_ordered <= product.quantity in the view
    # Ensure total_price is calculated correctly, likely in the view during creation. 