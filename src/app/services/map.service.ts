import { Injectable } from '@angular/core';
import { Coordinates } from './location.service';

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
  private map: any = null;
  private markers: any[] = [];
  private userLocationMarker: any = null;
  private L: any = null;

  async initializeMap(containerId: string, center: Coordinates, zoom: number = 13): Promise<any> {
    // Dynamic import for SSR compatibility
    if (!this.L) {
      this.L = await import('leaflet');
    }

    // Clean up existing map
    if (this.map) {
      this.map.remove();
    }

    // Fix default marker icon paths
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
      iconUrl: '/assets/leaflet/marker-icon.png',
      shadowUrl: '/assets/leaflet/marker-shadow.png',
    });

    // Initialize map
    this.map = this.L.map(containerId, {
      zoomControl: false, // We'll add custom controls
      attributionControl: true
    }).setView([center.lat, center.lng], zoom);

    // Add tile layer (OpenStreetMap)
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add custom zoom control
    this.L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    return this.map;
  }

  addUserLocationMarker(coordinates: Coordinates): void {
    if (!this.map || !this.L) return;

    // Remove existing user location marker
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // User location icon
    const userLocationIcon = this.L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-marker">
          <div class="user-marker-inner"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Add new user location marker
    this.userLocationMarker = this.L.marker([coordinates.lat, coordinates.lng], {
      icon: userLocationIcon,
      zIndexOffset: 1000 // Ensure it's on top
    }).addTo(this.map);

    // Add accuracy circle
    this.L.circle([coordinates.lat, coordinates.lng], {
      radius: 100, // 100 meters accuracy
      fillColor: '#007AFF',
      fillOpacity: 0.1,
      color: '#007AFF',
      weight: 2,
      opacity: 0.3
    }).addTo(this.map);
  }

  addMarkers(markers: MapMarker[]): void {
    if (!this.map || !this.L) return;

    // Clear existing markers
    this.clearMarkers();

    // Custom icon for listings
    const listingIcon = this.L.divIcon({
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

    // Add new markers
    markers.forEach(markerData => {
      const marker = this.L.marker([markerData.coordinates.lat, markerData.coordinates.lng], {
        icon: listingIcon
      });

      // Create popup content
      const popupContent = `
        <div class="map-popup">
          <h4 class="popup-title">${markerData.title}</h4>
          <p class="popup-description">${markerData.description}</p>
          <div class="popup-price">₹${markerData.price}</div>
          <button class="popup-button" data-marker-id="${markerData.id}">View Details</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        if (markerData.onClick) {
          markerData.onClick();
        }
      });

      // Handle popup button click
      marker.on('popupopen', () => {
        const button = document.querySelector(`[data-marker-id="${markerData.id}"]`);
        if (button && markerData.onClick) {
          button.addEventListener('click', markerData.onClick);
        }
      });

      marker.addTo(this.map);
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
    if (!this.map || !this.L || markers.length === 0) return;

    const group = new this.L.FeatureGroup(
      markers.map(marker =>
        this.L.marker([marker.coordinates.lat, marker.coordinates.lng])
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
