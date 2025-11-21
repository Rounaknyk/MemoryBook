'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Location } from '@/types/memory';

const libraries: ('places' | 'geocoding')[] = ['places', 'geocoding'];

interface LocationPickerProps {
    value?: Location;
    onChange: (location: Location | undefined) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '0.5rem',
};

const defaultCenter = {
    lat: 19.0760, // Mumbai coordinates (default)
    lng: 72.8777,
};

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [enabled, setEnabled] = useState<boolean>(!!value);
    const [center, setCenter] = useState(value ? { lat: value.lat, lng: value.lng } : defaultCenter);
    const [marker, setMarker] = useState(value ? { lat: value.lat, lng: value.lng } : null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Load Google Maps script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Toggle location feature
    const handleToggle = () => {
        const newEnabled = !enabled;
        setEnabled(newEnabled);

        if (!newEnabled) {
            // Clear location when disabled
            onChange(undefined);
            setMarker(null);
            setError('');
        }
    };

    // Get current location
    const handleCurrentLocation = useCallback(() => {
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const geocoder = new google.maps.Geocoder();

                try {
                    const result = await geocoder.geocode({
                        location: { lat: latitude, lng: longitude }
                    });

                    if (result.results[0]) {
                        const place = result.results[0];
                        const location: Location = {
                            address: place.formatted_address,
                            lat: latitude,
                            lng: longitude,
                            placeId: place.place_id,
                            placeName: place.address_components[0]?.long_name || 'Current Location',
                        };

                        setCenter({ lat: latitude, lng: longitude });
                        setMarker({ lat: latitude, lng: longitude });
                        onChange(location);
                    }
                } catch (err) {
                    console.error('Geocoding error:', err);
                    setError('Failed to get address for your location');
                }

                setLoading(false);
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve your location. Please check permissions.');
                setLoading(false);
            }
        );
    }, [onChange]);

    // Handle place selection from autocomplete
    const handlePlaceSelect = () => {
        const autocomplete = autocompleteRef.current;
        if (!autocomplete) return;

        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
            setError('No details available for entered location');
            return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const location: Location = {
            address: place.formatted_address || '',
            lat,
            lng,
            placeId: place.place_id,
            placeName: place.name || place.address_components?.[0]?.long_name,
        };

        setCenter({ lat, lng });
        setMarker({ lat, lng });
        onChange(location);
        setError('');
    };

    if (!enabled) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                        Add Location (Optional)
                    </label>
                    <button
                        type="button"
                        onClick={handleToggle}
                        className="text-sm text-pink-500 hover:text-pink-600 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Enable Location
                    </button>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    Pin this memory to a location on your map
                </p>
            </div>
        );
    }

    // Handle loading and error states
    if (loadError) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Error loading Google Maps</p>
                <p className="text-xs">{loadError.message}</p>
            </div>
        );
    }

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Google Maps API key not configured</p>
                <p className="text-xs">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="animate-spin w-6 h-6 border-3 border-pink-200 border-t-pink-500 rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading Google Maps...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                    Location
                </label>
                <button
                    type="button"
                    onClick={handleToggle}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Remove Location
                </button>
            </div>

            <div className="space-y-3">
                {/* Current Location Button */}
                <button
                    type="button"
                    onClick={handleCurrentLocation}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {loading ? 'Getting location...' : 'Use Current Location'}
                </button>

                {/* Search Box */}
                <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceSelect}
                >
                    <input
                        type="text"
                        placeholder="Search for a place..."
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-300 focus:outline-none"
                    />
                </Autocomplete>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Map Preview */}
                {marker && (
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={15}
                            onLoad={(map) => { mapRef.current = map; }}
                            options={{
                                disableDefaultUI: true,
                                zoomControl: true,
                            }}
                        >
                            <Marker position={marker} />
                        </GoogleMap>
                    </div>
                )}

                {/* Selected Location Info */}
                {value && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            {value.placeName || 'Selected Location'}
                        </p>
                        <p className="text-xs text-gray-600">{value.address}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
