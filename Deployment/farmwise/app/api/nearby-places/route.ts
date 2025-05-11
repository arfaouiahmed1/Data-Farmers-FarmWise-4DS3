import { NextResponse } from 'next/server';

// Define types for OpenStreetMap elements
interface OSMTags {
  name?: string;
  amenity?: string;
  research?: string;
  office?: string;
  government?: string;
  phone?: string;
  website?: string;
  description?: string;
  opening_hours?: string;
  address?: string;
  [key: string]: string | undefined; // Allow for other tag keys
}

interface OSMElement {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags: OSMTags;
}

interface OSMResponse {
  elements: OSMElement[];
}

// Result format for the frontend
interface LabResult {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string | null;
  description: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// API returning only the two Tunisian soil testing labs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Convert to numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // Instead of searching, return the two specific soil testing labs in Tunisia
    const tunisianLabs: LabResult[] = [
      {
        id: "1",
        name: "Institut National de la Recherche Agronomique de Tunisie",
        type: "research_institute",
        address: "Rue Hédi Karray, Ariana 2080, Tunisia",
        phone: "+216 71 230 024",
        website: "http://www.inrat.agrinet.tn/",
        description: "National research institute for agriculture that provides soil testing services",
        hours: "Mon-Fri 8:30-16:30",
        coordinates: {
          lat: 36.8489675,
          lng: 10.1681782
        }
      },
      {
        id: "2",
        name: "Direction Générale des Ressources en Sol",
        type: "government",
        address: "30 Rue Alain Savary, Tunis 1002, Tunisia",
        phone: "+216 71 891 041",
        website: null,
        description: "Government office for soil resources management with testing facilities",
        hours: "Mon-Fri 8:00-17:00",
        coordinates: {
          lat: 36.8394828,
          lng: 10.1846374
        }
      }
    ];
    
    return NextResponse.json({ results: tunisianLabs });
  } catch (error) {
    console.error('Error in nearby-places API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
} 