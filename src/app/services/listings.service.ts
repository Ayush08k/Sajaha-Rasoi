import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, GeoPoint, doc, updateDoc, deleteDoc, where } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from './auth.service';

export interface Listing {
  id?: string;
  name: string;
  description: string;
  price: number;
  quantity: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  imageUrl?: string;
  senderId: string;
  senderName?: string;
  senderPhone?: string;
  createdAt: any;
  status: 'active' | 'sold' | 'expired';
}

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);
  private authService: AuthService = inject(AuthService);

  /**
   * Creates a new listing in Firestore
   */
  async createListing(listingData: Omit<Listing, 'id' | 'senderId' | 'createdAt' | 'status'>, imageFile?: File): Promise<string> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create a listing');
    }

    let imageUrl = '';
    
    // Upload image if provided
    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile, user.uid);
    }

    const listing: Omit<Listing, 'id'> = {
      ...listingData,
      imageUrl,
      senderId: user.uid,
      senderName: user.displayName || 'Anonymous',
      senderPhone: user.phoneNumber || '',
      createdAt: serverTimestamp(),
      status: 'active'
    };

    const listingsRef = collection(this.firestore, 'listings');
    const docRef = await addDoc(listingsRef, listing);
    return docRef.id;
  }

  /**
   * Uploads an image to Firebase Storage and returns the download URL
   */
  private async uploadImage(file: File, userId: string): Promise<string> {
    const timestamp = Date.now();
    const fileName = `listings/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Gets all active listings from Firestore
   */
  async getActiveListings(): Promise<Listing[]> {
    const listingsRef = collection(this.firestore, 'listings');
    const q = query(listingsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Listing));
  }

  /**
   * Gets listings for a specific user
   */
  async getUserListings(userId: string): Promise<Listing[]> {
    const listingsRef = collection(this.firestore, 'listings');
    const q = query(
      listingsRef,
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Listing));
  }

  /**
   * Updates an existing listing
   */
  async updateListing(listingId: string, updateData: Partial<Listing>, newImageFile?: File): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to update a listing');
    }

    let imageUrl = updateData.imageUrl;

    // Upload new image if provided
    if (newImageFile) {
      imageUrl = await this.uploadImage(newImageFile, user.uid);
    }

    const listingRef = doc(this.firestore, 'listings', listingId);
    await updateDoc(listingRef, {
      ...updateData,
      ...(imageUrl && { imageUrl }),
      updatedAt: new Date()
    });
  }

  /**
   * Deletes a listing
   */
  async deleteListing(listingId: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to delete a listing');
    }

    const listingRef = doc(this.firestore, 'listings', listingId);
    await deleteDoc(listingRef);

    // TODO: Also delete the associated image from storage if needed
  }

  /**
   * Updates listing status (active, sold, expired)
   */
  async updateListingStatus(listingId: string, status: 'active' | 'sold' | 'expired'): Promise<void> {
    const listingRef = doc(this.firestore, 'listings', listingId);
    await updateDoc(listingRef, {
      status,
      updatedAt: new Date()
    });
  }
}
