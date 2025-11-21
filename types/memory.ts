export interface Location {
    address: string;           // Human-readable address
    lat: number;              // Latitude
    lng: number;              // Longitude
    placeId?: string;         // Google Place ID
    placeName?: string;       // Short name (e.g., "Marine Drive")
}

export interface Memory {
    id: string;
    date: string; // YYYY-MM-DD format
    title: string;
    caption: string;
    notes: string[];
    imageUrls: string[]; // Changed to array for multiple images
    location?: Location; // Optional location data
    activityTags?: string[]; // Optional activity tags
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
}

export interface CreateMemoryInput {
    date: string;
    title: string;
    caption: string;
    notes: string[];
    imageFiles: File[]; // Changed to array
    location?: Location; // Optional location
    activityTags?: string[];
}

export interface UpdateMemoryInput {
    id: string;
    date?: string;
    title?: string;
    caption?: string;
    notes?: string[];
    imageFiles?: File[]; // Changed to array
    location?: Location; // Optional location
    activityTags?: string[];
}
