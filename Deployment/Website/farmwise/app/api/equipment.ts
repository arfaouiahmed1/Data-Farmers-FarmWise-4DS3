import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from './auth';

// Define types
export interface Equipment {
  id?: string;
  name: string;
  type: string;
  purchaseDate: string | null;
  status: 'Operational' | 'Maintenance Needed' | 'Out of Service';
  nextMaintenance: string | null;
  notes?: string;
  farmer?: number;
  created_at?: string;
  updated_at?: string;
}

const equipmentService = {
  // Get all equipment items
  async getEquipment(): Promise<Equipment[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/equipment/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  },

  // Get equipment that needs maintenance
  async getMaintenanceNeeded(): Promise<Equipment[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/equipment/maintenance_needed/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance needed equipment:', error);
      return [];
    }
  },

  // Get equipment by type
  async getEquipmentByType(type: string): Promise<Equipment[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_BASE_URL}/core/equipment/by_type/?type=${type}`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} equipment:`, error);
      return [];
    }
  },

  // Add a new equipment item
  async addEquipment(equipment: Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>): Promise<Equipment> {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_BASE_URL}/core/equipment/`, equipment, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Update an existing equipment item
  async updateEquipment(id: string, equipment: Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>): Promise<Equipment> {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_BASE_URL}/core/equipment/${id}/`, equipment, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Delete an equipment item
  async deleteEquipment(id: string | undefined): Promise<boolean> {
    if (!id) return false;
    
    try {
      const token = authService.getToken();
      await axios.delete(`${API_BASE_URL}/core/equipment/${id}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return false;
    }
  }
};

export default equipmentService; 