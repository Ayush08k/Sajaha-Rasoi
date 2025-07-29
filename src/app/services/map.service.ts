import { Injectable } from '@angular/core';
import { Coordinates } from './location.service';
// **THE FIX**: Changed to a static, namespaced import.
import * as L from 'leaflet';

export interface MapMarker {
  id: string;
  coordinates: Coordinates;
  title: string;
  description: string;
  price: number;
  onClick?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  // Use Leaflet's types for better code quality
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private userLocationMarker: L.Marker | null = null;
  
  // The private 'L' property is no longer needed

  // **THE FIX**: Removed 'async' as the import is no longer dynamic
  initializeMap(containerId: string, center: Coordinates, zoom: number = 13): L.Map | null {
    // Clean up existing map
    if (this.map) {
      this.map.remove();
    }

    // Fix default marker icon paths using the imported 'L'
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png', // Note: Removed leading slash for better compatibility
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    // Initialize map using 'L'
    this.map = L.map(containerId, {
      zoomControl: false,
      attributionControl: true
    }).setView([center.lat, center.lng], zoom);

    // Add tile layer (OpenStreetMap) using 'L'
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add custom zoom control using 'L'
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    return this.map;
  }

  addUserLocationMarker(coordinates: Coordinates): void {
    if (!this.map) return;

    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    const userLocationIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-marker">
          <div class="user-marker-inner"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userLocationMarker = L.marker([coordinates.lat, coordinates.lng], {
      icon: userLocationIcon,
      zIndexOffset: 1000
    }).addTo(this.map);

    L.circle([coordinates.lat, coordinates.lng], {
      radius: 100,
      fillColor: '#007AFF',
      fillOpacity: 0.1,
      color: '#007AFF',
      weight: 2,
      opacity: 0.3
    }).addTo(this.map);
  }

  addMarkers(markers: MapMarker[]): void {
    if (!this.map) return;

    this.clearMarkers();

    const listingIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-pin">
          <div class="marker-content">
            <span class="material-symbols-outlined">shopping_basket</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    markers.forEach(markerData => {
      const marker = L.marker([markerData.coordinates.lat, markerData.coordinates.lng], {
        icon: listingIcon
      });

      const popupContent = `
        <div class="map-popup">
          <h4 class="popup-title">${markerData.title}</h4>
          <p class="popup-description">${markerData.description}</p>
          <div class="popup-price">₹${markerData.price}</div>
          <button class="popup-button" data-marker-id="${markerData.id}">View Details</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (markerData.onClick) {
          markerData.onClick();
        }
      });

      marker.on('popupopen', () => {
        const button = document.querySelector(`[data-marker-id="${markerData.id}"]`);
        if (button && markerData.onClick) {
          button.addEventListener('click', markerData.onClick);
        }
      });

      marker.addTo(this.map!);
      this.markers.push(marker);
    });
  }

  clearMarkers(): void {
    if (!this.map) return;

    this.markers.forEach(marker => {
      this.map!.removeLayer(marker);
    });
    this.markers = [];
  }

  centerMap(coordinates: Coordinates, zoom?: number): void {
    if (!this.map) return;

    if (zoom) {
      this.map.setView([coordinates.lat, coordinates.lng], zoom);
    } else {
      this.map.panTo([coordinates.lat, coordinates.lng]);
    }
  }

  fitBounds(markers: MapMarker[], padding: number = 50): void {
    if (!this.map || markers.length === 0) return;

    const group = new L.FeatureGroup(
      markers.map(marker =>
        L.marker([marker.coordinates.lat, marker.coordinates.lng])
      )
    );

    this.map.fitBounds(group.getBounds(), { padding: [padding, padding] });
  }

  getCurrentBounds(): any {
    return this.map ? this.map.getBounds() : null;
  }

  getZoom(): number {
    return this.map ? this.map.getZoom() : 13;
  }

  onMapMove(callback: (center: Coordinates, zoom: number) => void): void {
    if (!this.map) return;

    this.map.on('moveend', () => {
      const center = this.map!.getCenter();
      const zoom = this.map!.getZoom();
      callback({ lat: center.lat, lng: center.lng }, zoom);
    });
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers = [];
    this.userLocationMarker = null;
  }
}
