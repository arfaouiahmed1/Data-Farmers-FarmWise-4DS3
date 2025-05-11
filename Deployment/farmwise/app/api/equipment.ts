import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from './auth';

// Define types
export type EquipmentType = 'Tractor' | 'Harvester' | 'Seeder' | 'Sprayer' | 'Trailer' | 'Tillage' | 'Other';
export type EquipmentStatus = 'Operational' | 'Maintenance Needed' | 'Out of Service';

export interface Equipment {
  id?: string;
  name: string;
  type: EquipmentType;
  purchaseDate: string | null;
  status: EquipmentStatus;
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
      
      // Convert snake_case to camelCase
      return response.data.map((item: any) => ({
        id: item.id?.toString(),
        name: item.name,
        type: item.type,
        purchaseDate: item.purchase_date,
        status: item.status,
        nextMaintenance: item.next_maintenance,
        notes: item.notes,
        farmer: item.farmer,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
      
      // Convert snake_case to camelCase
      return response.data.map((item: any) => ({
        id: item.id?.toString(),
        name: item.name,
        type: item.type,
        purchaseDate: item.purchase_date,
        status: item.status,
        nextMaintenance: item.next_maintenance,
        notes: item.notes,
        farmer: item.farmer,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
      
      // Convert snake_case to camelCase
      return response.data.map((item: any) => ({
        id: item.id?.toString(),
        name: item.name,
        type: item.type,
        purchaseDate: item.purchase_date,
        status: item.status,
        nextMaintenance: item.next_maintenance,
        notes: item.notes,
        farmer: item.farmer,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error(`Error fetching ${type} equipment:`, error);
      return [];
    }
  },
  // Add a new equipment item
  async addEquipment(equipment: Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>): Promise<Equipment> {
    try {
      const token = authService.getToken();
      
      // Ensure required fields are present
      if (!equipment.name || !equipment.type) {
        throw new Error("Name and type are required fields");
      }
      
      // Format dates properly using simple string manipulation
      let purchaseDate = null;
      let nextMaintenance = null;
      
      if (equipment.purchaseDate) {
        // Format to YYYY-MM-DD, stripping any time component
        const dateStr = String(equipment.purchaseDate);
        purchaseDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      if (equipment.nextMaintenance) {
        // Format to YYYY-MM-DD, stripping any time component
        const dateStr = String(equipment.nextMaintenance);
        nextMaintenance = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      // Get current user and extract farmer ID
      const currentUser = authService.getCurrentUser();
      let farmerId = null;
      
      // Try to extract farmer ID safely, handling different response structures
      if (currentUser) {
        // Access it as any to bypass TypeScript checks since we know the structure
        const userAny = currentUser as any;
        
        if (userAny.profile?.farmer_data?.id) {
          farmerId = userAny.profile.farmer_data.id;
        }
      }
      
      if (!farmerId) {
        console.warn('No farmer ID found in user profile, API request may fail');
      }
      
      // Convert camelCase to snake_case before sending to the backend
      const snakeCaseEquipment = {
        name: String(equipment.name).trim(),
        type: equipment.type,
        purchase_date: purchaseDate,
        status: equipment.status || 'Operational',
        next_maintenance: nextMaintenance,
        notes: equipment.notes || '',
        farmer: farmerId // Include farmer ID in the request
      };
      
      console.log('Sending data to backend:', snakeCaseEquipment);
      
      const response = await axios.post(`${API_BASE_URL}/core/equipment/`, snakeCaseEquipment, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Convert response from snake_case to camelCase
      const data = response.data;
      return {
        id: data.id?.toString(),
        name: data.name,
        type: data.type,
        purchaseDate: data.purchase_date,
        status: data.status,
        nextMaintenance: data.next_maintenance,
        notes: data.notes,
        farmer: data.farmer,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error: any) {
      console.error('Error adding equipment:', error);
      console.error('Response data:', error.response?.data);
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Update an existing equipment item
  async updateEquipment(id: string, equipment: Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>): Promise<Equipment> {
    try {
      const token = authService.getToken();
      
      // Ensure required fields are present
      if (!equipment.name || !equipment.type) {
        throw new Error("Name and type are required fields");
      }
      
      // Format dates properly using simple string manipulation
      let purchaseDate = null;
      let nextMaintenance = null;
      
      if (equipment.purchaseDate) {
        // Format to YYYY-MM-DD, stripping any time component
        const dateStr = String(equipment.purchaseDate);
        purchaseDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      if (equipment.nextMaintenance) {
        // Format to YYYY-MM-DD, stripping any time component
        const dateStr = String(equipment.nextMaintenance);
        nextMaintenance = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      // Get current user and extract farmer ID
      const currentUser = authService.getCurrentUser();
      let farmerId = null;
      
      // Try to extract farmer ID safely, handling different response structures
      if (currentUser) {
        // Access it as any to bypass TypeScript checks since we know the structure
        const userAny = currentUser as any;
        
        if (userAny.profile?.farmer_data?.id) {
          farmerId = userAny.profile.farmer_data.id;
        }
      }
      
      if (!farmerId) {
        console.warn('No farmer ID found in user profile, API request may fail');
      }
      
      // Convert camelCase to snake_case before sending to the backend
      const snakeCaseEquipment = {
        name: String(equipment.name).trim(),
        type: equipment.type,
        purchase_date: purchaseDate,
        status: equipment.status || 'Operational',
        next_maintenance: nextMaintenance,
        notes: equipment.notes || '',
        farmer: farmerId // Include farmer ID in the request
      };
      
      console.log('Updating equipment with data:', snakeCaseEquipment);
      
      const response = await axios.put(`${API_BASE_URL}/core/equipment/${id}/`, snakeCaseEquipment, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Convert response from snake_case to camelCase
      const data = response.data;
      return {
        id: data.id?.toString(),
        name: data.name,
        type: data.type,
        purchaseDate: data.purchase_date,
        status: data.status,
        nextMaintenance: data.next_maintenance,
        notes: data.notes,
        farmer: data.farmer,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      console.error('Response data:', error.response?.data);
      throw error; // Propagate the error to handle it at component level
    }
  },

  // Delete an equipment item
  async deleteEquipment(id: string | undefined): Promise<boolean> {
    if (!id) return false;
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await axios.delete(`${API_BASE_URL}/core/equipment/${id}/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error; // Propagate the error to be handled by the calling component
    }
  }
};

export default equipmentService;