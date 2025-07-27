import { Injectable, signal } from '@angular/core';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // Current user location
  currentLocation = signal<LocationInfo | null>(null);
  locationError = signal<string>('');
  isLoadingLocation = signal<boolean>(false);

  constructor() {
    this.getCurrentLocation();
  }

  async getCurrentLocation(): Promise<void> {
    this.isLoadingLocation.set(true);
    this.locationError.set('');

    try {
      // Check if we're in a browser environment and geolocation is supported
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await this.getPosition();
      const coords: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Get address from coordinates using reverse geocoding
      const locationInfo = await this.reverseGeocode(coords);
      this.currentLocation.set(locationInfo);

    } catch (error) {
      let errorMessage = 'Unable to get your location';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout.';
            break;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      this.locationError.set(errorMessage);
      console.error('Location error:', error);

      // Set default location (Delhi, India) if geolocation fails
      this.setDefaultLocation();
    } finally {
      this.isLoadingLocation.set(false);
    }
  }

  private getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private async reverseGeocode(coordinates: Coordinates): Promise<LocationInfo> {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      
      return {
        coordinates,
        address: this.formatAddress(data.display_name),
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown City',
        state: data.address?.state || 'Unknown State',
        country: data.address?.country || 'Unknown Country'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Return coordinates with generic address if geocoding fails
      return {
        coordinates,
        address: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country'
      };
    }
  }

  private formatAddress(fullAddress: string): string {
    // Extract relevant parts of the address
    const parts = fullAddress.split(', ');
    if (parts.length >= 3) {
      return parts.slice(0, 3).join(', ');
    }
    return fullAddress;
  }

  private setDefaultLocation(): void {
    // Default to Delhi, India coordinates
    const defaultLocation: LocationInfo = {
      coordinates: { lat: 28.7041, lng: 77.1025 },
      address: 'Delhi, India',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    };
    this.currentLocation.set(defaultLocation);
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  // Get nearby locations within a radius
  getNearbyItems<T extends { lat: number; lng: number }>(
    items: T[], 
    radius: number = 10
  ): (T & { distance: number })[] {
    const currentLoc = this.currentLocation();
    if (!currentLoc) return items.map(item => ({ ...item, distance: 0 }));

    return items
      .map(item => ({
        ...item,
        distance: this.calculateDistance(currentLoc.coordinates, { lat: item.lat, lng: item.lng })
      }))
      .filter(item => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        return true;
      } else if (permission.state === 'prompt') {
        // Try to get location, which will prompt the user
        await this.getCurrentLocation();
        return this.currentLocation() !== null;
      } else {
        this.locationError.set('Location permission denied');
        return false;
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Refresh current location
  async refreshLocation(): Promise<void> {
    await this.getCurrentLocation();
  }
}
