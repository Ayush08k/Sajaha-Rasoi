import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

interface UserProfile {
  name: string;
  phone: string;
  location: string;
  joinDate: string;
  rating: number;
  totalListed: number;
  activeListing: number;
}

interface UserListing {
  id: string;
  name: string;
  price: number;
  quantity: string;
  description: string;
  status: 'active' | 'sold' | 'expired';
  createdDate: string;
  views: number;
  interestedCount: number;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
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

  activeFilter = signal<'all' | 'active' | 'sold'>('all');
  
  allListings = signal<UserListing[]>([
    {
      id: '1',
      name: 'Fresh Paneer',
      price: 250,
      quantity: '2 kg',
      description: 'High quality fresh paneer, perfect for various dishes',
      status: 'active',
      createdDate: '2 days ago',
      views: 24,
      interestedCount: 3
    },
    {
      id: '2',
      name: 'Red Onions',
      price: 30,
      quantity: '5 kg',
      description: 'Fresh red onions from wholesale',
      status: 'active',
      createdDate: '1 week ago',
      views: 18,
      interestedCount: 1
    },
    {
      id: '3',
      name: 'Tomatoes',
      price: 40,
      quantity: '3 kg',
      description: 'Ripe tomatoes, excellent quality',
      status: 'sold',
      createdDate: '2 weeks ago',
      views: 31,
      interestedCount: 5
    },
    {
      id: '4',
      name: 'Green Chilies',
      price: 15,
      quantity: '1 kg',
      description: 'Fresh green chilies, medium spice',
      status: 'expired',
      createdDate: '3 weeks ago',
      views: 12,
      interestedCount: 0
    }
  ]);

  constructor(
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit() {}

  onBack() {
    this.router.navigate(['/home']);
  }

  onCreateNewListing() {
    this.router.navigate(['/create-listing']);
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
    console.log('Edit listing:', listingId);
    // Navigate to edit form
  }

  onDeleteListing(listingId: string) {
    console.log('Delete listing:', listingId);
    // Show confirmation dialog and delete
    const currentListings = this.allListings();
    const updatedListings = currentListings.filter(listing => listing.id !== listingId);
    this.allListings.set(updatedListings);
  }

  onLogout() {
    this.router.navigate(['/login']);
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
