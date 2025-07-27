import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-listing.component.html',
  styleUrl: './create-listing.component.css'
})
export class CreateListingComponent {
  itemName = signal('');
  quantity = signal('');
  price = signal('');
  description = signal('');
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string>('');

  constructor(private router: Router) {}

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
           this.description().trim() !== '';
  }

  onPostItem() {
    if (this.isFormValid()) {
      // Simulate posting the item
      console.log('Posting item:', {
        name: this.itemName(),
        quantity: this.quantity(),
        price: this.price(),
        description: this.description(),
        image: this.selectedImage()
      });
      
      // Navigate back to home
      this.router.navigate(['/home']);
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
}
