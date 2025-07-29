import { Injectable } from '@angular/core';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  /**
   * Converts a location string to coordinates using Google Maps Geocoding API
   * For demo purposes, we'll use a simple location mapping
   */
  async geocodeLocation(address: string): Promise<GeocodeResult | null> {
    try {
      // For demo purposes, provide some predefined locations in Haryana
      const locationMappings: { [key: string]: GeocodeResult } = {
        'kharkhoda': { lat: 29.3089, lng: 76.9133, formattedAddress: 'Kharkhoda, Haryana, India' },
        'kharkhoda haryana': { lat: 29.3089, lng: 76.9133, formattedAddress: 'Kharkhoda, Haryana, India' },
        'gurgaon': { lat: 28.4595, lng: 77.0266, formattedAddress: 'Gurgaon, Haryana, India' },
        'gurgaon haryana': { lat: 28.4595, lng: 77.0266, formattedAddress: 'Gurgaon, Haryana, India' },
        'faridabad': { lat: 28.4089, lng: 77.3178, formattedAddress: 'Faridabad, Haryana, India' },
        'faridabad haryana': { lat: 28.4089, lng: 77.3178, formattedAddress: 'Faridabad, Haryana, India' },
        'hisar': { lat: 29.1492, lng: 75.7217, formattedAddress: 'Hisar, Haryana, India' },
        'hisar haryana': { lat: 29.1492, lng: 75.7217, formattedAddress: 'Hisar, Haryana, India' },
        'panipat': { lat: 29.3909, lng: 76.9635, formattedAddress: 'Panipat, Haryana, India' },
        'panipat haryana': { lat: 29.3909, lng: 76.9635, formattedAddress: 'Panipat, Haryana, India' },
        'rohtak': { lat: 28.8955, lng: 76.6066, formattedAddress: 'Rohtak, Haryana, India' },
        'rohtak haryana': { lat: 28.8955, lng: 76.6066, formattedAddress: 'Rohtak, Haryana, India' },
        'karnal': { lat: 29.6857, lng: 76.9905, formattedAddress: 'Karnal, Haryana, India' },
        'karnal haryana': { lat: 29.6857, lng: 76.9905, formattedAddress: 'Karnal, Haryana, India' },
        'yamunanagar': { lat: 30.1290, lng: 77.2674, formattedAddress: 'Yamunanagar, Haryana, India' },
        'yamunanagar haryana': { lat: 30.1290, lng: 77.2674, formattedAddress: 'Yamunanagar, Haryana, India' }
      };

      const normalizedAddress = address.toLowerCase().trim();
      
      // Try exact match first
      if (locationMappings[normalizedAddress]) {
        return locationMappings[normalizedAddress];
      }

      // Try partial matches
      for (const key in locationMappings) {
        if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
          return locationMappings[key];
        }
      }

      // If no match found, return a default location in Haryana
      console.warn(`Location "${address}" not found in predefined mappings. Using default location.`);
      return {
        lat: 29.0588,
        lng: 76.0856,
        formattedAddress: `${address}, Haryana, India`
      };

    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * For future implementation with real Google Maps API
   * This would make an actual API call to Google Maps Geocoding service
   */
  private async geocodeWithGoogleMaps(address: string): Promise<GeocodeResult | null> {
    // This would be implemented when we have access to Google Maps API key
    // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
    // const data = await response.json();
    // ... process response
    return null;
  }

  /**
   * Gets current user location using browser geolocation
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Calculates distance between two coordinates in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
