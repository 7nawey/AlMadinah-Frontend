import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  orderItems: any[] = [];
  loading = false;
  stockWarnings: Record<string, string> = {};

  checkoutForm: FormGroup;

  constructor(
    public i18n: I18nService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    const saved = localStorage.getItem('currentOrder');
    if (saved) {
      this.orderItems = JSON.parse(saved);
    }

    this.checkoutForm = this.fb.group({
      customerPhone: ['', [Validators.required, Validators.pattern(/^(01)[0-25][0-9]{8}$/)]],
      customerAddress: ['', [Validators.required, Validators.minLength(5)]],
      notes: ['']
    });

    // Real-time validation feedback
    this.checkoutForm.valueChanges.subscribe(() => {
      // Errors will be shown in template via form controls
    });
  }

  ngOnInit(): void {
    // Validate stock on load
    this.validateAllStock();
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }

  get orderType(): 'retail' | 'wholesale' {
    return this.subtotal >= 1000 ? 'wholesale' : 'retail';
  }

  get deliveryFee(): number {
    return this.orderType === 'wholesale' ? 0 : 25;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  get isValid(): boolean {
    return this.orderItems.length > 0 && this.checkoutForm.valid && !this.hasStockErrors();
  }

  hasStockErrors(): boolean {
    return this.orderItems.some(item => item.stockQuantity !== undefined && item.quantity > item.stockQuantity);
  }

  validateAllStock(): void {
    this.stockWarnings = {};
    for (const item of this.orderItems) {
      if (item.stockQuantity !== undefined && item.quantity > item.stockQuantity) {
        item.quantity = item.stockQuantity;
        this.stockWarnings[item.id] = this.i18n.lang === 'ar'
          ? 'تم تعديل الكمية إلى المخزون المتاح'
          : 'Quantity adjusted to available stock';
      }
    }
    if (Object.keys(this.stockWarnings).length > 0) {
      localStorage.setItem('currentOrder', JSON.stringify(this.orderItems));
    }
  }

  getItemStock(item: any): number {
    return item.stockQuantity ?? Infinity;
  }

  canIncreaseQty(item: any): boolean {
    const stock = this.getItemStock(item);
    return item.quantity < stock;
  }

  changeQty(index: number, delta: number): void {
    const item = this.orderItems[index];
    const stock = this.getItemStock(item);
    const newQty = item.quantity + delta;

    if (newQty < 1) {
      item.quantity = 1;
    } else if (newQty > stock) {
      item.quantity = stock;
      this.stockWarnings[item.id] = this.i18n.lang === 'ar'
        ? 'الحد الأقصى: ' + stock
        : 'Max available: ' + stock;
      this.toast.warning(this.stockWarnings[item.id]);
    } else {
      item.quantity = newQty;
      this.stockWarnings[item.id] = '';
    }

    localStorage.setItem('currentOrder', JSON.stringify(this.orderItems));
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
    localStorage.setItem('currentOrder', JSON.stringify(this.orderItems));
    if (!this.orderItems.length) {
      this.router.navigate(['/']);
    }
  }

  getPhoneError(): string {
    const phone = this.checkoutForm.get('customerPhone');
    if (!phone || !phone.invalid || !phone.touched) return '';
    if (phone.hasError('required')) {
      return this.i18n.lang === 'ar' ? 'رقم الهاتف مطلوب.' : 'Phone number is required.';
    }
    if (phone.hasError('pattern')) {
      return this.i18n.lang === 'ar' ? 'رقم هاتف مصري غير صالح (مثال: 01012345678).' : 'Invalid Egyptian phone number (e.g., 01012345678).';
    }
    return '';
  }

  getAddressError(): string {
    const address = this.checkoutForm.get('customerAddress');
    if (!address || !address.invalid || !address.touched) return '';
    if (address.hasError('required')) {
      return this.i18n.lang === 'ar' ? 'العنوان مطلوب.' : 'Address is required.';
    }
    if (address.hasError('minlength')) {
      return this.i18n.lang === 'ar' ? 'العنوان قصير جداً.' : 'Address is too short.';
    }
    return '';
  }

  proceedToPayment(): void {
    this.checkoutForm.markAllAsTouched();
    if (!this.isValid) {
      if (this.hasStockErrors()) {
        this.toast.error(this.i18n.lang === 'ar'
          ? 'بعض المنتجات تتجاوز المخزون المتاح'
          : 'Some items exceed available stock');
      }
      return;
    }

    const formValue = this.checkoutForm.value;
    localStorage.setItem('currentOrder', JSON.stringify(this.orderItems));
    localStorage.setItem('checkoutInfo', JSON.stringify({
      customerPhone: formValue.customerPhone.trim(),
      customerAddress: formValue.customerAddress.trim(),
      notes: formValue.notes,
      deliveryFee: this.deliveryFee,
      subtotal: this.subtotal,
      total: this.total,
      orderType: this.orderType
    }));
    this.router.navigate(['/payment']);
  }
}
