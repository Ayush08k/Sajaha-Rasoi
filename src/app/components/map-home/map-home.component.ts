import { Component, signal, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { LocationService, LocationInfo, Coordinates } from '../../services/location.service';
import { MapService, MapMarker } from '../../services/map.service';
import { AuthService } from '../../services/auth.service';
import { ListingsService, Listing } from '../../services/listings.service';
import { Subscription } from 'rxjs';

interface MapListing extends Listing {
  lat: number;
  lng: number;
  distance?: number;
  sellerName?: string;
  rating?: number;
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
  listings = signal<MapListing[]>([]);
  selectedListing = signal<MapListing | null>(null);
  showBottomSheet = signal(false);
  mapInitialized = signal(false);
  nearbyListings = signal<MapListing[]>([]);
  isLoadingListings = signal(true);

  private userSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    public locationService: LocationService,
    private mapService: MapService,
    private authService: AuthService,
    private listingsService: ListingsService
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (!user) {
        // Redirect to login if not authenticated
        this.router.navigate(['/login']);
      }
    });

    // Initialize app data regardless of auth state (it will redirect if needed)
    this.loadListings();
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
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.mapService.destroy();
  }

  async loadListings() {
    this.isLoadingListings.set(true);

    try {
      const listings = await this.listingsService.getActiveListings();

      // Transform Firestore listings to map listings
      const mapListings: MapListing[] = listings
        .filter(listing => listing.coordinates) // Only listings with coordinates
        .map(listing => ({
          ...listing,
          lat: listing.coordinates!.lat,
          lng: listing.coordinates!.lng,
          sellerName: listing.senderName || 'Anonymous',
          rating: 4.5 // Default rating for now
        }));

      this.listings.set(mapListings);
      this.updateNearbyListings();

      // Update map markers if map is initialized
      if (this.mapInitialized()) {
        this.updateMapMarkers();
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      // Fallback to empty array
      this.listings.set([]);
    } finally {
      this.isLoadingListings.set(false);
    }
  }

  async refreshListings() {
    await this.loadListings();
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
          this.loadListings();
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
      { lat: 29.0588, lng: 76.0856 }; // Default to Haryana region

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
    const mapMarkers: MapMarker[] = this.nearbyListings()
      .filter(listing => typeof listing.id === 'string')
      .map(listing => ({
        id: listing.id as string,
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
    const user = this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onMarkerClick(listing: Listing) {
    // Ensure the listing has lat/lng and other MapListing properties
    const mapListing: MapListing = {
      ...listing,
      lat: listing.coordinates?.lat ?? 0,
      lng: listing.coordinates?.lng ?? 0,
      sellerName: (listing as any).senderName || 'Anonymous',
      rating: (listing as any).rating ?? 4.5
    };
    this.selectedListing.set(mapListing);
    this.showBottomSheet.set(true);
  }

  onCloseBottomSheet() {
    this.showBottomSheet.set(false);
    this.selectedListing.set(null);
  }

  onClaimAndChat(listing: MapListing) {
    // Check if user is trying to chat with themselves
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.uid === listing.senderId) {
      alert('You cannot chat with yourself!');
      return;
    }
    this.router.navigate(['/chat', listing.id]);
  }

  onQuickChat(listing: MapListing, event: Event) {
    event.stopPropagation();
    // Check if user is trying to chat with themselves
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.uid === listing.senderId) {
      alert('You cannot chat with yourself!');
      return;
    }
    this.router.navigate(['/chat', listing.id]);
  }

  onThemeToggle() {
    this.themeService.toggleTheme();
  }

  getListingsToShow(): Listing[] {
    return this.nearbyListings();
  }

  getDistanceString(listing: MapListing): string {
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
