import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateOrderDto } from '../../core/models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentMethod: 'card' | 'wallet' | 'cod' = 'card';
  walletPhone = '';
  loading = false;
  /** True when the customer returned from the payment gateway.
   *  This is NOT proof of payment — the backend webhook confirms. */
  pendingConfirmation = false;
  /** True only for Cash on Delivery, where order creation is the confirmation. */
  success = false;
  error = false;
  errorMessage = '';

  orderItems: any[] = [];
  checkoutInfo: any = {};

  constructor(private api: ApiService, public i18n: I18nService, private router: Router, private toast: ToastService) {
    const items = localStorage.getItem('currentOrder');
    const info = localStorage.getItem('checkoutInfo');
    if (items) this.orderItems = JSON.parse(items);
    if (info) this.checkoutInfo = JSON.parse(info);
  }

  ngOnInit(): void {
    // Check if we were redirected back from Paymob
    const urlParams = new URLSearchParams(window.location.search);
    const paymobSuccess = urlParams.get('success');
    if (paymobSuccess !== null) {
      if (paymobSuccess === 'true') {
        // Browser redirect is NOT proof of payment. The backend webhook is the source of truth.
        // Show a processing message instead of definitive success.
        this.pendingConfirmation = true;
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('checkoutInfo');
        setTimeout(() => this.router.navigate(['/']), 8000);
      } else {
        this.error = true;
        this.errorMessage = this.i18n.t('paymentFailed');
      }
    }
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }

  get deliveryFee(): number {
    return this.checkoutInfo.deliveryFee || 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  isValidWalletPhone(phone: string): boolean {
    return /^(01)[0-25][0-9]{8}$/.test(phone.trim());
  }

  pay(): void {
    if (this.paymentMethod === 'cod') {
      this.placeOrder();
      return;
    }

    if (this.paymentMethod === 'wallet' && !this.isValidWalletPhone(this.walletPhone)) {
      this.toast.error(this.i18n.t('invalidWalletPhone'));
      return;
    }

    // Paymob flow: create internal order FIRST, then initiate Paymob payment
    this.loading = true;

    const orderData: CreateOrderDto = {
      customerPhone: this.checkoutInfo.customerPhone,
      customerAddress: this.checkoutInfo.customerAddress,
      notes: this.checkoutInfo.notes,
      items: this.orderItems.map(i => ({
        productId: i.id,
        quantity: i.quantity
      })),
      isInStore: false
    };

    this.api.createOrder(orderData).subscribe({
      next: (orderRes) => {
        if (!orderRes.data?.orderId) {
          this.loading = false;
          this.error = true;
          this.errorMessage = this.i18n.lang === 'ar' ? 'فشل إنشاء الطلب.' : 'Failed to create order.';
          return;
        }

        const internalOrderId = orderRes.data.orderId;

        // The backend loads the order and uses its actual TotalPrice
        this.api.initiatePayment({
          orderId: internalOrderId,
          currency: 'EGP',
          paymentMethod: this.paymentMethod,
          walletPhone: this.paymentMethod === 'wallet' ? this.walletPhone.trim() : undefined
        }).subscribe({
          next: (paymentRes) => {
            this.loading = false;
            if (this.paymentMethod === 'wallet') {
              // Wallet: redirect to the wallet provider confirmation page
              if (paymentRes.data?.redirectUrl) {
                window.location.href = paymentRes.data.redirectUrl;
              } else {
                this.error = true;
                this.errorMessage = this.i18n.lang === 'ar' ? 'فشل بدء الدفع بالمحفظة.' : 'Failed to initiate wallet payment.';
              }
            } else {
              // Card: existing hosted iframe flow
              if (paymentRes.data?.iframeUrl) {
                window.location.href = paymentRes.data.iframeUrl;
              } else {
                this.error = true;
                this.errorMessage = this.i18n.lang === 'ar' ? 'فشل بدء الدفع.' : 'Failed to initiate payment.';
              }
            }
          },
          error: (err: any) => {
            this.loading = false;
            this.error = true;
            this.errorMessage = this.i18n.lang === 'ar' ? 'فشل بدء الدفع.' : 'Failed to initiate payment.';
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = this.i18n.lang === 'ar' ? 'فشل إنشاء الطلب.' : 'Failed to create order.';
        console.error(err);
      }
    });
  }

  private placeOrder(): void {
    this.loading = true;
    const orderData: CreateOrderDto = {
      customerPhone: this.checkoutInfo.customerPhone,
      customerAddress: this.checkoutInfo.customerAddress,
      notes: this.checkoutInfo.notes,
      items: this.orderItems.map(i => ({
        productId: i.id,
        quantity: i.quantity
      })),
      isInStore: false
    };

    this.api.createOrder(orderData).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('checkoutInfo');
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = this.i18n.lang === 'ar' ? 'فشل إنشاء الطلب.' : 'Failed to create order.';
        console.error(err);
      }
    });
  }
}
