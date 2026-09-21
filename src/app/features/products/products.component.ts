import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProductDto } from '../../core/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  categoryId: string | null = null;
  products: ProductDto[] = [];
  pageNumber = 1;
  pageSize = 20;
  hasMore = true;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('id');
      if (this.categoryId) {
        this.resetAndLoad();
      }
    });
  }

  getProductName(p: ProductDto): string {
    return this.i18n.lang === 'en' ? (p.nameEn || p.nameAr) : p.nameAr;
  }

  resetAndLoad(): void {
    this.pageNumber = 1;
    this.products = [];
    this.hasMore = true;
    this.errorMessage = null;
    this.loadProducts();
  }

  loadProducts(): void {
    if (!this.categoryId || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    this.api.getProductsByCategory(this.categoryId, { pageNumber: this.pageNumber, pageSize: this.pageSize })
      .subscribe({
        next: (res) => {
          const data = res.data?.data ?? [];
          const totalCount = res.data?.totalCount ?? 0;

          this.products = [...this.products, ...data];
          this.hasMore = this.products.length < totalCount;
          this.pageNumber++;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ فشل تحميل المنتجات:', err);
          this.errorMessage = this.i18n.lang === 'ar' ? 'حدث خطأ أثناء تحميل المنتجات.' : 'Error loading products.';
          this.loading = false;
        }
      });
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

  trackByProduct(index: number, p: ProductDto): string {
    return p.id;
  }
}
