import { Component, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListingsService, Listing } from '../../services/listings.service';
import { GeocodingService } from '../../services/geocoding.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.css'
})
export class CreateListingComponent implements OnInit {
  itemName = signal('');
  quantity = signal('');
  price = signal('');
  description = signal('');
  location = signal('');
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string>('');

  isSubmitting = signal(false);
  submitError = signal('');
  isLoadingLocation = signal(false);
  isEditMode = signal(false);
  editingListingId = signal<string | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private listingsService: ListingsService,
    private geocodingService: GeocodingService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Check if we're in edit mode
    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (editId) {
      this.isEditMode.set(true);
      this.editingListingId.set(editId);
      await this.loadListingForEdit(editId);
    }
  }

  private async loadListingForEdit(listingId: string) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      // Get user's listings and find the one to edit
      const userListings = await this.listingsService.getUserListings(user.uid);
      const listing = userListings.find(l => l.id === listingId);

      if (listing) {
        // Populate form with existing data
        this.itemName.set(listing.name);
        this.quantity.set(listing.quantity);
        this.price.set(listing.price.toString());
        this.description.set(listing.description);
        this.location.set(listing.location);

        if (listing.imageUrl) {
          this.imagePreview.set(listing.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading listing for edit:', error);
      this.submitError.set('Failed to load listing data. Please try again.');
    }
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage.set(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onRemoveImage() {
    this.selectedImage.set(null);
    this.imagePreview.set('');
  }

  isFormValid(): boolean {
    return this.itemName().trim() !== '' &&
           this.quantity().trim() !== '' &&
           this.price().trim() !== '' &&
           this.description().trim() !== '' &&
           this.location().trim() !== '';
  }

  async onPostItem() {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    try {
      // Geocode the location if it has changed
      const geocodeResult = await this.geocodingService.geocodeLocation(this.location());

      if (!geocodeResult) {
        throw new Error('Unable to find the specified location. Please try a different location.');
      }

      if (this.isEditMode() && this.editingListingId()) {
        // Update existing listing
        const updateData = {
          name: this.itemName().trim(),
          quantity: this.quantity().trim(),
          price: parseFloat(this.price()),
          description: this.description().trim(),
          location: geocodeResult.formattedAddress,
          coordinates: {
            lat: geocodeResult.lat,
            lng: geocodeResult.lng
          }
        };

        await this.listingsService.updateListing(
          this.editingListingId()!,
          updateData,
          this.selectedImage() || undefined
        );

        console.log('Listing updated successfully');
      } else {
        // Create new listing
        const listingData = {
          name: this.itemName().trim(),
          quantity: this.quantity().trim(),
          price: parseFloat(this.price()),
          description: this.description().trim(),
          location: geocodeResult.formattedAddress,
          coordinates: {
            lat: geocodeResult.lat,
            lng: geocodeResult.lng
          }
        };

        const listingId = await this.listingsService.createListing(
          listingData,
          this.selectedImage() || undefined
        );

        console.log('Listing created successfully with ID:', listingId);
      }

      // Navigate back to home
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error saving listing:', error);
      this.submitError.set(error.message || 'Failed to save listing. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onItemNameChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.itemName.set(input.value);
  }

  onQuantityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.quantity.set(input.value);
  }

  onPriceChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Only allow numbers and decimal point
    const value = input.value.replace(/[^0-9.]/g, '');
    this.price.set(value);
    input.value = value;
  }

  onDescriptionChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.description.set(textarea.value);
  }

  onLocationChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.location.set(input.value);
    if (this.submitError()) {
      this.submitError.set('');
    }
  }

  async useCurrentLocation() {
    this.isLoadingLocation.set(true);

    try {
      const currentCoords = await this.geocodingService.getCurrentLocation();

      if (currentCoords) {
        // For demo purposes, set a default location in Haryana
        // In real implementation, you would reverse geocode the coordinates
        this.location.set('Kharkhoda, Haryana');
      } else {
        this.location.set('Kharkhoda, Haryana'); // Fallback location
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      this.location.set('Kharkhoda, Haryana'); // Fallback location
    } finally {
      this.isLoadingLocation.set(false);
    }
  }
}
