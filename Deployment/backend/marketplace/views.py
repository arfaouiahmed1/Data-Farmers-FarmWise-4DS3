from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import ProductCategory, Product, Order
from .serializers import ProductCategorySerializer, ProductSerializer, OrderSerializer
from django.utils import timezone

class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for anyone, write for authenticated

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True) # Only show active products by default
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Allow filtering by category ID
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        # Allow filtering by seller ID
        seller_id = self.request.query_params.get('seller_id')
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        return queryset

    def perform_create(self, serializer):
        # Automatically set the seller to the currently authenticated user
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        # Ensure only the seller can update their product
        product = self.get_object()
        if product.seller != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You do not have permission to edit this product.")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure only the seller can delete their product (or mark as inactive)
        if instance.seller != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You do not have permission to delete this product.")
        # Instead of deleting, consider marking as inactive:
        # instance.is_active = False
        # instance.save()
        # For true deletion:
        super().perform_destroy(instance)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_products(self, request):
        """Returns products listed by the current authenticated user."""
        user_products = Product.objects.filter(seller=request.user)
        serializer = self.get_serializer(user_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def deactivate(self, request, pk=None):
        """Deactivates a product listing."""
        product = self.get_object()
        if product.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to deactivate this product.'}, status=status.HTTP_403_FORBIDDEN)
        product.is_active = False
        product.save()
        return Response({'status': 'product deactivated'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def activate(self, request, pk=None):
        """Activates a product listing if it belongs to the user."""
        product = self.get_object()
        if product.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to activate this product.'}, status=status.HTTP_403_FORBIDDEN)
        product.is_active = True
        product.save()
        return Response({'status': 'product activated'}, status=status.HTTP_200_OK)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users should only see their own orders (as buyer or seller)
        user = self.request.user
        if user.is_staff:
            return Order.objects.all() # Staff can see all orders
        return Order.objects.filter(Q(buyer=user) | Q(product__seller=user)).distinct()

    @transaction.atomic
    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        quantity_ordered = serializer.validated_data.get('quantity_ordered')
        
        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.seller == self.request.user:
            raise serializers.ValidationError("You cannot order your own product.")

        if product.quantity < quantity_ordered:
            raise serializers.ValidationError(f"Not enough stock available for {product.name}. Available: {product.quantity}")

        total_price = product.price * quantity_ordered
        order = serializer.save(buyer=self.request.user, total_price=total_price)
        
        # Decrease product quantity
        product.quantity -= quantity_ordered
        if product.quantity == 0:
            product.is_active = False # Optionally deactivate if stock runs out
        product.save()
        return order

    # Only allow buyer to cancel if order is in a cancellable state
    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.buyer != request.user:
            return Response({'detail': 'You do not have permission to cancel this order.'}, status=status.HTTP_403_FORBIDDEN)
        
        cancellable_statuses = ['pending_payment', 'pending_confirmation']
        if order.status not in cancellable_statuses:
            return Response({'detail': f'Order cannot be cancelled in its current state: {order.get_status_display()}.\n                                        Only orders that are { ", ".join(cancellable_statuses) } can be cancelled'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order.status = 'cancelled_buyer'
            order.save()
            # Re-increment product quantity
            product = order.product
            product.quantity += order.quantity_ordered
            if not product.is_active and product.quantity > 0:
                product.is_active = True # Reactivate if stock was 0
            product.save()
        return Response({'status': 'order cancelled'}, status=status.HTTP_200_OK)
    
    # Allow seller to update order status (e.g., confirm, ship, complete)
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_order_status(self, request, pk=None):
        order = self.get_object()
        if order.product.seller != request.user and not request.user.is_staff:
            return Response({'detail': 'You do not have permission to update this order status.'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if not new_status:
            return Response({'detail': 'Status not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Add logic here to prevent invalid status transitions if needed
        order.status = new_status
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
