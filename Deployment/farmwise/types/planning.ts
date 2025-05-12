// Define shared types for the planning section

export interface FarmEvent {
    id: number | string; // Use string if using UUIDs later
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: string;
    type?: string;
    description?: string; // Add description field
    // Add any other relevant fields that might be shared
  }

// Define RotationEntry interface
export interface RotationEntry {
    id: number | string;
    field: string;
    year: number;
    season: string;
    crop: string;
    status: string; // e.g., Planned, Growing, Harvested, Fallow
    family: string; // Crop family, e.g., Grass, Legume, Nightshade
}

// Define AllocationEntry interface
export interface AllocationEntry {
    id: number | string;
    task: string;
    startDate: Date;
    endDate: Date;
    resourceType: 'equipment' | 'labor' | 'material';
    resourceName: string; // e.g., 'Tractor John Deere 7R', 'Field Crew Alpha', 'Seed Pack Corn XY'
    field?: string; // Optional: Field associated with the task
    notes?: string;
  }

// Add other planning-related types here if needed
// e.g., CropRotationPlan, ResourceItem 