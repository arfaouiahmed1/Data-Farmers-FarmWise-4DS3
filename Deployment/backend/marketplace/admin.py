from django.contrib import admin
from .models import ProductCategory, Product, Order

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'seller', 'quantity', 'unit', 'date_posted', 'is_active')
    list_filter = ('category', 'is_active', 'date_posted', 'seller')
    search_fields = ('name', 'description', 'seller__username')
    autocomplete_fields = ('category', 'seller')
    # readonly_fields = ('date_posted',)
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'image_url')
        }),
        ('Categorization & Pricing', {
            'fields': ('category', 'price', 'quantity', 'unit')
        }),
        ('Listing Details', {
            'fields': ('seller', 'location_text', 'is_active', 'date_posted')
        }),
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_name', 'buyer_username', 'quantity_ordered', 'total_price', 'order_date', 'status')
    list_filter = ('status', 'order_date', 'buyer')
    search_fields = ('id', 'product__name', 'buyer__username')
    autocomplete_fields = ('buyer', 'product')
    readonly_fields = ('order_date', 'total_price') # total_price might be calculated

    def product_name(self, obj):
        return obj.product.name
    product_name.short_description = 'Product'

    def buyer_username(self, obj):
        return obj.buyer.username
    buyer_username.short_description = 'Buyer'
