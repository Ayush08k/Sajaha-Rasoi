import { Component, signal, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ListingsService, Listing } from '../../services/listings.service';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';

interface UserProfile {
  name: string;
  phone: string;
  location: string;
  joinDate: string;
  rating: number;
  totalListed: number;
  activeListing: number;
}

interface UserListing extends Listing {
  createdDate?: string;
  views?: number;
  interestedCount?: number;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  userProfile = signal<UserProfile>({
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    location: 'Kharkhoda, Haryana',
    joinDate: 'January 2024',
    rating: 4.7,
    totalListed: 15,
    activeListing: 3
  });

  // Name editing state
  isEditingName = signal(false);
  editedName = signal('');
  isUpdatingName = signal(false);
  nameError = signal('');

  activeFilter = signal<'all' | 'active' | 'sold'>('all');
  
  allListings = signal<UserListing[]>([]);
  isLoadingListings = signal(true);
  editingListing = signal<UserListing | null>(null);
  isDeletingListing = signal<string | null>(null);

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    private firestore: Firestore,
    private listingsService: ListingsService
  ) {}

  async ngOnInit() {
    await this.loadUserProfile();
    await this.loadUserListings();
  }

  private async loadUserProfile() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        this.userProfile.update(profile => ({
          ...profile,
          name: userData['displayName'] || userData['username'] || profile.name,
          phone: userData['phoneNumber'] || profile.phone
        }));
        this.editedName.set(userData['displayName'] || userData['username'] || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  private async loadUserListings() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoadingListings.set(true);

    try {
      const listings = await this.listingsService.getUserListings(user.uid);

      // Transform to UserListing format with additional fields
      const userListings: UserListing[] = listings.map(listing => ({
        ...listing,
        createdDate: this.formatCreatedDate(listing.createdAt),
        views: 0, // Placeholder - would need view tracking
        interestedCount: 0 // Placeholder - would need interest tracking
      }));

      this.allListings.set(userListings);

      // Update profile stats
      this.userProfile.update(profile => ({
        ...profile,
        totalListed: userListings.length,
        activeListing: userListings.filter(l => l.status === 'active').length
      }));
    } catch (error) {
      console.error('Error loading user listings:', error);
      this.allListings.set([]);
    } finally {
      this.isLoadingListings.set(false);
    }
  }

  private formatCreatedDate(timestamp: any): string {
    if (!timestamp) return 'Unknown';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  onBack() {
    this.router.navigate(['/home']);
  }

  onCreateNewListing() {
    this.router.navigate(['/create-listing']);
  }

  async refreshListings() {
    await this.loadUserListings();
  }

  @HostListener('window:focus')
  onWindowFocus() {
    // Refresh listings when user returns to this tab/window
    this.refreshListings();
  }

  setFilter(filter: 'all' | 'active' | 'sold') {
    this.activeFilter.set(filter);
  }

  getFilteredListings() {
    const filter = this.activeFilter();
    if (filter === 'all') return this.allListings();
    return this.allListings().filter(listing => listing.status === filter);
  }

  getFilterCount(filter: 'all' | 'active' | 'sold'): number {
    if (filter === 'all') return this.allListings().length;
    return this.allListings().filter(listing => listing.status === filter).length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'sold': return 'badge-info';
      case 'expired': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'sold': return 'Sold';
      case 'expired': return 'Expired';
      default: return status;
    }
  }

  onEditListing(listingId: string) {
    const listing = this.allListings().find(l => l.id === listingId);
    if (listing) {
      this.editingListing.set(listing);
      // Navigate to create-listing with edit mode
      this.router.navigate(['/create-listing'], {
        queryParams: { edit: listing.id }
      });
    }
  }

  async onDeleteListing(listingId: string) {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    this.isDeletingListing.set(listingId);

    try {
      await this.listingsService.deleteListing(listingId);

      // Remove from local state
      const currentListings = this.allListings();
      const updatedListings = currentListings.filter(listing => listing.id !== listingId);
      this.allListings.set(updatedListings);

      // Update profile stats
      this.userProfile.update(profile => ({
        ...profile,
        totalListed: updatedListings.length,
        activeListing: updatedListings.filter(l => l.status === 'active').length
      }));
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    } finally {
      this.isDeletingListing.set(null);
    }
  }

  async onLogout() {
    try {
      await this.authService.signOut();
      // Navigation will be handled by the auth state subscription in map-home
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, navigate to login page
      this.router.navigate(['/login']);
    }
  }

  startEditingName() {
    this.isEditingName.set(true);
    this.editedName.set(this.userProfile().name);
    this.nameError.set('');
  }

  cancelEditingName() {
    this.isEditingName.set(false);
    this.editedName.set('');
    this.nameError.set('');
  }

  async saveNameEdit() {
    const newName = this.editedName().trim();

    if (newName.length < 2) {
      this.nameError.set('Name must be at least 2 characters');
      return;
    }

    this.isUpdatingName.set(true);
    this.nameError.set('');

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Update user document in Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userRef, {
        displayName: newName,
        username: newName,
        updatedAt: new Date()
      });

      // Update local state
      this.userProfile.update(profile => ({
        ...profile,
        name: newName
      }));

      this.isEditingName.set(false);
    } catch (error: any) {
      console.error('Error updating name:', error);
      this.nameError.set('Failed to update name. Please try again.');
    } finally {
      this.isUpdatingName.set(false);
    }
  }

  onThemeToggle() {
    this.themeService.toggleTheme();
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
