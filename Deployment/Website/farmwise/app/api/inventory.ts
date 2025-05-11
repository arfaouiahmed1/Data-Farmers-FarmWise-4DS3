import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from './auth';

// Define types
export interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  farmer?: number;
  is_low_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define types for category units
export interface CategoryUnits {
  categories: {[key: string]: string};
  category_units: {
    [category: string]: Array<[string, string]>; // [value, label]
  };
}

const inventoryService = {
  // Get all inventory items
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/inventory/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  },

  // Get inventory items that are low on stock
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/inventory/low_stock/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  },

  // Get inventory items by category
  async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/inventory/by_category/?category=${category}`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${category} items:`, error);
      return [];
    }
  },
  
  // Get category units mapping
  async getCategoryUnits(): Promise<CategoryUnits> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/inventory/category_units/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching category units:', error);
      // Return default mapping in case of error
      return {
        categories: {
          'Seeds': 'Seeds',
          'Fertilizers': 'Fertilizers', 
          'Pesticides': 'Pesticides',
          'Fuel': 'Fuel',
          'Parts': 'Parts',
          'Tools': 'Tools'
        },
        category_units: {
          'Seeds': [['kg', 'Kilograms']],
          'Fertilizers': [['kg', 'Kilograms']],
          'Pesticides': [['L', 'Liters']],
          'Fuel': [['L', 'Liters']],
          'Parts': [['units', 'Units']],
          'Tools': [['units', 'Units']]
        }
      };
    }
  },

  // Add a new inventory item
  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'farmer' | 'created_at' | 'updated_at' | 'is_low_stock'>): Promise<InventoryItem> {
    try {
      const token = authService.getToken();
      // Ensure we're sending proper numeric values as strings with 2 decimal places
      const formattedItem = {
        ...item,
        quantity: typeof item.quantity === 'number' ? item.quantity.toFixed(2) : Number(item.quantity).toFixed(2),
        low_stock_threshold: typeof item.low_stock_threshold === 'number' ? item.low_stock_threshold.toFixed(2) : Number(item.low_stock_threshold).toFixed(2),
      };
      
      console.log('Formatted inventory item for API:', formattedItem);
      
      const response = await axios.post(`${API_BASE_URL}/core/inventory/`, formattedItem, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Update an existing inventory item
  async updateInventoryItem(id: string, item: Omit<InventoryItem, 'id' | 'farmer' | 'created_at' | 'updated_at' | 'is_low_stock'>): Promise<InventoryItem> {
    try {
      const token = authService.getToken();
      // Ensure we're sending proper numeric values as strings with 2 decimal places
      const formattedItem = {
        ...item,
        quantity: typeof item.quantity === 'number' ? item.quantity.toFixed(2) : Number(item.quantity).toFixed(2),
        low_stock_threshold: typeof item.low_stock_threshold === 'number' ? item.low_stock_threshold.toFixed(2) : Number(item.low_stock_threshold).toFixed(2),
      };
      
      console.log('Formatted inventory item for API update:', formattedItem);
      
      const response = await axios.put(`${API_BASE_URL}/core/inventory/${id}/`, formattedItem, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      // Log more detailed error information
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Delete an inventory item
  async deleteInventoryItem(id: string | undefined): Promise<boolean> {
    if (!id) return false;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${API_BASE_URL}/core/inventory/${id}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return false;
    }
  }
};

export default inventoryService; 