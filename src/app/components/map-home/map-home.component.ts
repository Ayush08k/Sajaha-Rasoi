import { Component, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { LocationService, LocationInfo, Coordinates } from '../../services/location.service';
import { MapService, MapMarker } from '../../services/map.service';

interface Listing {
  id: string;
  name: string;
  price: number;
  quantity: string;
  description: string;
  sellerName: string;
  rating: number;
  imageUrl: string;
  lat: number;
  lng: number;
  distance?: number;
  location?: string;
}

// Removed MarkerPosition interface as we'll use real coordinates

@Component({
  selector: 'app-map-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-home.component.html',
  styleUrl: './map-home.component.css'
})
export class MapHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  listings = signal<Listing[]>([]);
  selectedListing = signal<Listing | null>(null);
  showBottomSheet = signal(false);
  mapInitialized = signal(false);
  nearbyListings = signal<Listing[]>([]);

  constructor(
    private router: Router,
    public themeService: ThemeService,
    public locationService: LocationService,
    private mapService: MapService
  ) {}

  ngOnInit() {
    this.initializeMockData();
    this.setupLocationWatcher();
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        this.initializeMap();
      }
    }, 200);
  }

  ngOnDestroy() {
    this.mapService.destroy();
  }

  private initializeMockData() {
    // Get base coordinates for generating nearby listings
    const currentLocation = this.locationService.currentLocation();
    const baseLat = currentLocation ? currentLocation.coordinates.lat : 28.7041;
    const baseLng = currentLocation ? currentLocation.coordinates.lng : 77.1025;

    // Generate listings around the current location
    const baseListings: Listing[] = [
      {
        id: '1',
        name: 'Fresh Paneer',
        price: 250,
        quantity: '2 kg',
        description: 'High quality fresh paneer, perfect for various dishes. Made this morning from pure milk.',
        sellerName: 'Rajesh Kumar',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
        lat: baseLat + 0.003,
        lng: baseLng + 0.002,
        location: 'Sector 15, Delhi'
      },
      {
        id: '2',
        name: 'Red Onions',
        price: 30,
        quantity: '5 kg',
        description: 'Fresh red onions, excellent for cooking. Surplus from wholesale purchase, good quality.',
        sellerName: 'Priya Sharma',
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
        lat: baseLat - 0.002,
        lng: baseLng + 0.004,
        location: 'Rohini, Delhi'
      },
      {
        id: '3',
        name: 'Fresh Tomatoes',
        price: 40,
        quantity: '3 kg',
        description: 'Ripe tomatoes, perfect for curries and salads. Very fresh quality, just arrived.',
        sellerName: 'Mohammad Ali',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264ce03a8?w=400&h=300&fit=crop',
        lat: baseLat + 0.005,
        lng: baseLng - 0.003,
        location: 'Pitampura, Delhi'
      },
      {
        id: '4',
        name: 'Green Chilies',
        price: 15,
        quantity: '1 kg',
        description: 'Fresh green chilies, medium spice level. Perfect for various Indian dishes.',
        sellerName: 'Sunita Devi',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1583392151171-0c6e2a0bb2d3?w=400&h=300&fit=crop',
        lat: baseLat - 0.004,
        lng: baseLng - 0.002,
        location: 'Model Town, Delhi'
      },
      {
        id: '5',
        name: 'Fresh Spinach',
        price: 20,
        quantity: '1 bundle',
        description: 'Fresh organic spinach, perfect for healthy meals. Harvested this morning.',
        sellerName: 'Meera Devi',
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
        lat: baseLat + 0.001,
        lng: baseLng + 0.006,
        location: 'Ashok Vihar, Delhi'
      },
      {
        id: '6',
        name: 'Basmati Rice',
        price: 80,
        quantity: '2 kg',
        description: 'Premium quality basmati rice, aged for better aroma and taste.',
        sellerName: 'Ramesh Singh',
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
        lat: baseLat - 0.001,
        lng: baseLng - 0.005,
        location: 'Shalimar Bagh, Delhi'
      },
      {
        id: '7',
        name: 'Fresh Milk',
        price: 50,
        quantity: '1 liter',
        description: 'Farm fresh cow milk, delivered twice daily. Rich in nutrients and taste.',
        sellerName: 'Farmer Suresh',
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
        lat: baseLat + 0.007,
        lng: baseLng + 0.001,
        location: 'Keshav Puram, Delhi'
      },
      {
        id: '8',
        name: 'Fresh Carrots',
        price: 35,
        quantity: '1 kg',
        description: 'Organic carrots, perfect for salads and cooking. Sweet and crunchy.',
        sellerName: 'Ravi Kumar',
        rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop',
        lat: baseLat - 0.006,
        lng: baseLng + 0.003,
        location: 'Wazirabad, Delhi'
      }
    ];

    this.listings.set(baseListings);
    this.updateNearbyListings();
  }

  private setupLocationWatcher() {
    // Watch for location changes and update nearby listings
    let previousLocation: LocationInfo | null = null;

    setInterval(() => {
      const currentLocation = this.locationService.currentLocation();

      if (currentLocation && currentLocation !== previousLocation) {
        // Location changed, regenerate listings around new location
        if (previousLocation === null ||
            this.locationService.calculateDistance(
              previousLocation.coordinates,
              currentLocation.coordinates
            ) > 0.5) { // Only regenerate if moved more than 500m
          this.initializeMockData();
        }

        this.updateNearbyListings();
        if (this.mapInitialized()) {
          this.updateMapMarkers();
        }
        previousLocation = currentLocation;
      }
    }, 2000);
  }

  private async initializeMap() {
    console.log('Starting map initialization...');

    const currentLocation = this.locationService.currentLocation();
    const center: Coordinates = currentLocation ?
      currentLocation.coordinates :
      { lat: 28.7041, lng: 77.1025 }; // Default to Delhi

    console.log('Map center:', center);

    try {
      // Wait a bit more to ensure DOM is ready
      const mapElement = document.getElementById('map-container');
      if (!mapElement) {
        console.error('Map container not found');
        return;
      }

      console.log('Map container found, initializing...');

      // Initialize map asynchronously
      await this.mapService.initializeMap('map-container', center, 14);

      console.log('Map initialized successfully');

      if (currentLocation) {
        this.mapService.addUserLocationMarker(currentLocation.coordinates);
        console.log('User location marker added');
      }

      this.updateMapMarkers();
      console.log('Map markers updated');

      this.mapInitialized.set(true);
      console.log('Map initialization complete');

      // Set up map event listeners
      this.mapService.onMapMove((newCenter, zoom) => {
        // Optionally update listings based on map bounds
        console.log('Map moved to:', newCenter, 'zoom:', zoom);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      // Show error state
      this.mapInitialized.set(false);
    }
  }

  private updateNearbyListings() {
    const nearby = this.locationService.getNearbyItems(this.listings(), 10); // 10km radius
    this.nearbyListings.set(nearby);
  }

  private updateMapMarkers() {
    const mapMarkers: MapMarker[] = this.nearbyListings().map(listing => ({
      id: listing.id,
      coordinates: { lat: listing.lat, lng: listing.lng },
      title: listing.name,
      description: listing.description,
      price: listing.price,
      onClick: () => this.onMarkerClick(listing)
    }));

    this.mapService.addMarkers(mapMarkers);
  }

  onCreateListing() {
    this.router.navigate(['/create-listing']);
  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  onMarkerClick(listing: Listing) {
    this.selectedListing.set(listing);
    this.showBottomSheet.set(true);
  }

  onCloseBottomSheet() {
    this.showBottomSheet.set(false);
    this.selectedListing.set(null);
  }

  onClaimAndChat(listing: Listing) {
    this.router.navigate(['/chat', listing.id]);
  }

  onQuickChat(listing: Listing, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/chat', listing.id]);
  }

  onThemeToggle() {
    this.themeService.toggleTheme();
  }

  getListingsToShow(): Listing[] {
    return this.nearbyListings();
  }

  getDistanceString(listing: Listing): string {
    return listing.distance ? this.locationService.formatDistance(listing.distance) : '';
  }

  getCurrentLocationString(): string {
    const location = this.locationService.currentLocation();
    if (location) {
      return `${location.city}, ${location.state}`;
    }
    return this.locationService.isLoadingLocation() ? 'Getting location...' : 'Location unavailable';
  }

  onLocationRefresh() {
    this.locationService.refreshLocation().then(() => {
      // After location refresh, update map center if available
      const location = this.locationService.currentLocation();
      if (location && this.mapInitialized()) {
        this.mapService.centerMap(location.coordinates, 14);
        this.mapService.addUserLocationMarker(location.coordinates);
      }
    });
  }

  onCenterOnUser() {
    const location = this.locationService.currentLocation();
    if (location && this.mapInitialized()) {
      this.mapService.centerMap(location.coordinates, 16);
    }
  }

  getStarArray(rating: number): { filled: boolean, partial: boolean }[] {
    return Array(5).fill(null).map((_, i) => {
      const starValue = i + 1;
      const filled = rating >= starValue;
      const partial = !filled && rating > i && rating < starValue;
      return { filled, partial };
    });
  }
}
