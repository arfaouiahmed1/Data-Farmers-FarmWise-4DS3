/**
 * Utility to create sample marketplace data for testing
 * This script creates sample products for the currently authenticated user
 */
import { createProduct } from './marketplaceService';
import { getSession } from '../auth/auth-utils';
import { notifications } from '@mantine/notifications';

// Sample product data
const sampleProducts = [
  {
    title: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking.',
    price: 5.99,
    category: 1, // Vegetables
    location: 'Tunis, Tunisia',
    mainImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=1000',
    type: 'resource',
    quantity: {
      value: 10,
      unit: 'kg'
    },
    isActive: true
  },
  {
    title: 'Premium Olive Oil',
    description: 'Extra virgin olive oil from century-old olive trees. Cold-pressed and unfiltered.',
    price: 15.99,
    category: 2, // Processed Foods
    location: 'Sfax, Tunisia',
    mainImage: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=1000',
    type: 'resource',
    quantity: {
      value: 5,
      unit: 'liter'
    },
    isActive: true
  },
  {
    title: 'Farmland for Rent',
    description: 'Fertile farmland available for seasonal rental. Irrigation system included.',
    price: 500,
    category: 3, // Land
    location: 'Sousse, Tunisia',
    mainImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
    type: 'land',
    size: {
      value: 2.5,
      unit: 'hectares'
    },
    isActive: true
  },
  {
    title: 'Tractor for Rent',
    description: 'Modern tractor available for daily or weekly rental. Includes basic implements.',
    price: 100,
    category: 4, // Equipment
    location: 'Bizerte, Tunisia',
    mainImage: 'https://images.unsplash.com/photo-1592840062661-a5f6c3a49363?auto=format&fit=crop&q=80&w=1000',
    type: 'equipment',
    condition: 'Good',
    isActive: true
  }
];

/**
 * Creates sample marketplace products for the authenticated user
 * @returns Promise that resolves when all products are created
 */
export const createSampleMarketplaceData = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session?.accessToken) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please log in to create sample data',
        color: 'red',
      });
      return false;
    }

    // Create each sample product
    for (const product of sampleProducts) {
      await createProduct(product);
    }

    notifications.show({
      title: 'Success',
      message: `Created ${sampleProducts.length} sample marketplace listings`,
      color: 'green',
    });
    
    return true;
  } catch (error: any) {
    console.error('Error creating sample data:', error);
    notifications.show({
      title: 'Error',
      message: `Failed to create sample data: ${error.message}`,
      color: 'red',
    });
    return false;
  }
};
