import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductDto } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: ProductDto | null = null;
  loading = false;
  errorMessage: string | null = null;
  imageBase = 'https://localhost:7178';
  quantity = 1;
  stockWarning = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      } else {
        this.errorMessage = this.i18n.lang === 'ar' ? 'معرف المنتج غير صالح.' : 'Invalid product ID.';
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.quantity = 1;
    this.stockWarning = '';
    this.api.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load product:', err);
        this.errorMessage = this.i18n.lang === 'ar' ? 'حدث خطأ أثناء تحميل تفاصيل المنتج.' : 'Error loading product details.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getImageUrl(): string {
    if (!this.product?.imageUrl) return '';
    return this.imageBase + this.product.imageUrl;
  }

  get maxStock(): number {
    return this.product?.stockQuantity ?? 0;
  }

  get isOutOfStock(): boolean {
    return this.maxStock <= 0;
  }

  get canIncrement(): boolean {
    return this.quantity < this.maxStock;
  }

  increment(): void {
    if (this.canIncrement) {
      this.quantity++;
      this.stockWarning = '';
    } else {
      this.stockWarning = this.i18n.lang === 'ar'
        ? 'لا يمكن تجاوز المخزون المتاح (' + this.maxStock + ')'
        : 'Cannot exceed available stock (' + this.maxStock + ')';
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.stockWarning = '';
    }
  }

  addToOrder(): void {
    if (!this.product || this.isOutOfStock) return;
    if (this.quantity > this.maxStock) {
      this.stockWarning = this.i18n.lang === 'ar'
        ? 'الكمية المطلوبة تتجاوز المخزون المتاح'
        : 'Requested quantity exceeds available stock';
      this.toast.warning(this.stockWarning);
      return;
    }

    const current = JSON.parse(localStorage.getItem('currentOrder') || '[]');
    const existing = current.find((i: any) => i.id === this.product!.id);
    if (existing) {
      const newQty = existing.quantity + this.quantity;
      if (newQty > this.maxStock) {
        this.stockWarning = this.i18n.lang === 'ar'
          ? 'الإجمالي في السلة يتجاوز المخزون (' + this.maxStock + ')'
          : 'Total in cart would exceed stock (' + this.maxStock + ')';
        this.toast.warning(this.stockWarning);
        return;
      }
      existing.quantity = newQty;
    } else {
      current.push({
        id: this.product.id,
        nameAr: this.product.nameAr,
        nameEn: this.product.nameEn,
        price: this.product.finalPrice ?? this.product.price,
        imageUrl: this.product.imageUrl,
        quantity: this.quantity,
        stockQuantity: this.product.stockQuantity
      });
    }
    localStorage.setItem('currentOrder', JSON.stringify(current));
    this.toast.success(this.i18n.lang === 'ar' ? 'تمت الإضافة للطلب!' : 'Added to order!');
  }

  buyNow(): void {
    if (!this.product || this.isOutOfStock) return;
    if (this.quantity > this.maxStock) {
      this.stockWarning = this.i18n.lang === 'ar'
        ? 'الكمية المطلوبة تتجاوز المخزون المتاح'
        : 'Requested quantity exceeds available stock';
      this.toast.warning(this.stockWarning);
      return;
    }

    const item = {
      id: this.product.id,
      nameAr: this.product.nameAr,
      nameEn: this.product.nameEn,
      price: this.product.finalPrice ?? this.product.price,
      imageUrl: this.product.imageUrl,
      quantity: this.quantity,
      stockQuantity: this.product.stockQuantity
    };
    localStorage.setItem('currentOrder', JSON.stringify([item]));
    this.router.navigate(['/checkout']);
  }
}
