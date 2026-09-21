import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { DealDto, ProductDto, CreateDealDto } from '../../../core/models';

@Component({
  selector: 'app-admin-deals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-deals.component.html',
  styleUrls: ['./admin-deals.component.css']
})
export class AdminDealsComponent implements OnInit {
  deals: DealDto[] = [];
  products: ProductDto[] = [];
  loading = false;
  showForm = false;
  editing = false;

  form = {
    id: '',
    productId: '',
    originalPrice: 0,
    discountedPrice: 0,
    discountPercentage: 0,
    startDate: '',
    endDate: ''
  };

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadDeals();
    this.loadProducts();
  }

  loadDeals(): void {
    this.loading = true;
    this.api.getDeals().subscribe({
      next: (res) => {
        this.deals = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل تحميل العروض' : 'Failed to load deals');
        this.loading = false;
      }
    });
  }

  loadProducts(): void {
    this.api.getProducts().subscribe({
      next: (res) => {
        this.products = res.data?.data ?? [];
      }
    });
  }

  openAdd(): void {
    this.showForm = true;
    this.editing = false;
    this.form = { id: '', productId: '', originalPrice: 0, discountedPrice: 0, discountPercentage: 0, startDate: '', endDate: '' };
  }

  edit(deal: DealDto): void {
    this.showForm = true;
    this.editing = true;
    this.form = {
      id: deal.id,
      productId: deal.productId,
      originalPrice: deal.originalPrice,
      discountedPrice: deal.discountedPrice,
      discountPercentage: deal.discountPercentage ?? 0,
      startDate: deal.startDate ? deal.startDate.split('T')[0] : '',
      endDate: deal.endDate ? deal.endDate.split('T')[0] : ''
    };
  }

  // Original price is auto-filled from the selected product — no manual entry needed.
  onProductChange(): void {
    const product = this.products.find(p => p.id === this.form.productId);
    if (product) {
      this.form.originalPrice = product.price;
      this.recalculateFromPercentage();
    }
  }

  // Given a discount %, compute the final price (original = 1000, 20% -> 800).
  recalculateFromPercentage(): void {
    if (this.form.originalPrice > 0 && this.form.discountPercentage > 0) {
      this.form.discountedPrice = Math.round(this.form.originalPrice * (1 - this.form.discountPercentage / 100) * 100) / 100;
    }
  }

  // Given a final price, compute the discount % (original = 1000, 800 -> 20%).
  recalculateFromDiscounted(): void {
    if (this.form.originalPrice > 0 && this.form.discountedPrice > 0) {
      this.form.discountPercentage = Math.round((1 - this.form.discountedPrice / this.form.originalPrice) * 10000) / 100;
    }
  }

  save(): void {
    if (!this.form.productId) {
      this.toast.error(this.i18n.lang === 'ar' ? 'اختر المنتج' : 'Please select a product');
      return;
    }

    if (!this.form.discountPercentage && !this.form.discountedPrice) {
      this.toast.error(this.i18n.lang === 'ar' ? 'أدخل نسبة الخصم أو السعر المخفض' : 'Enter a discount percentage or a discounted price');
      return;
    }

    const data: CreateDealDto = {
      productId: this.form.productId,
      originalPrice: this.form.originalPrice || undefined,
      discountedPrice: this.form.discountedPrice || undefined,
      discountPercentage: this.form.discountPercentage || undefined,
      startDate: this.form.startDate ? new Date(this.form.startDate).toISOString() : undefined,
      endDate: this.form.endDate ? new Date(this.form.endDate).toISOString() : undefined
    };

    if (this.editing) {
      this.api.updateDeal(this.form.id, { ...data, id: this.form.id, isActive: true }).subscribe({
        next: () => { this.showForm = false; this.loadDeals(); this.toast.success(this.i18n.lang === 'ar' ? 'تم التحديث' : 'Updated'); },
        error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل التحديث' : 'Failed')
      });
    } else {
      this.api.createDeal(data).subscribe({
        next: () => { this.showForm = false; this.loadDeals(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الإنشاء' : 'Created'); },
        error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الإنشاء' : 'Failed')
      });
    }
  }

  toggleActive(deal: DealDto): void {
    this.api.toggleDealActive(deal.id).subscribe({
      next: () => {
        deal.isActive = !deal.isActive;
        this.toast.success(deal.isActive ? (this.i18n.lang === 'ar' ? 'تم التفعيل' : 'Activated') : (this.i18n.lang === 'ar' ? 'تم الإلغاء' : 'Deactivated'));
      },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل التبديل' : 'Failed')
    });
  }

  deleteDeal(id: string): void {
    if (!confirm(this.i18n.lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    this.api.deleteDeal(id).subscribe({
      next: () => { this.loadDeals(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الحذف' : 'Failed')
    });
  }
}
