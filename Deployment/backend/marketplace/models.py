from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Product Categories"

class Product(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('litre', 'Litre'),
        ('ml', 'Millilitre'),
        ('unit', 'Unit'),
        ('dozen', 'Dozen'),
        ('tonne', 'Tonne'),
        ('acre', 'Acre'), # For land lease/sale perhaps
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products_for_sale')
    # For simplicity, storing image URLs or paths. For actual image files, use ImageField.
    image_url = models.URLField(max_length=1024, blank=True, null=True) # Placeholder for a primary image
    # Consider a separate model for multiple images if needed: ProductImage
    # image = models.ImageField(upload_to='marketplace_images/', blank=True, null=True) # Alternative for direct uploads

    location_text = models.CharField(max_length=255, blank=True, null=True, help_text="e.g., Farm address or city")
    # For more precise location:
    # latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    # longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='unit')
    
    date_posted = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True, help_text="Is the listing currently active and visible?")
    # Potential future fields:
    # condition (new, used)
    # expiry_date (for perishable goods or listings)

    def __str__(self):
        return f"{self.name} by {self.seller.username}"

    class Meta:
        ordering = ['-date_posted']

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('pending_confirmation', 'Pending Confirmation'), # Seller needs to confirm
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'), # For items that need preparation
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled_buyer', 'Cancelled by Buyer'),
        ('cancelled_seller', 'Cancelled by Seller'),
        ('disputed', 'Disputed'),
        ('completed', 'Completed'),
    ]

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='marketplace_orders')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='orders') # PROTECT to avoid deleting orders if product is deleted (mark product inactive instead)
    quantity_ordered = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_payment')
    
    # Shipping/Contact details - can be denormalized here or linked to user profile
    shipping_address = models.TextField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # payment_intent_id = models.CharField(max_length=255, blank=True, null=True) # For Stripe or other payment gateway integration

    def __str__(self):
        return f"Order #{self.id} for {self.product.name} by {self.buyer.username}"

    class Meta:
        ordering = ['-order_date']

# Consider adding a ProductImage model if multiple images per product are needed:
# class ProductImage(models.Model):
#     product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
#     image = models.ImageField(upload_to='marketplace_images/')
#     caption = models.CharField(max_length=255, blank=True, null=True)
#
#     def __str__(self):
#         return f"Image for {self.product.name}"

# Future considerations:
# - Reviews and Ratings model
# - Wishlist/Saved Items model
# - Seller profiles with more details
# - Messaging between buyer and seller
