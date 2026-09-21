import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  HomePageConfigDto,
  CategoryDto,
  ProductDto,
  UpdateCategoryOrderDto,
  UpdateFeaturedProductDto
} from '../../../core/models';

@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './admin-home-page.component.html',
  styleUrls: ['./admin-home-page.component.css']
})
export class AdminHomePageComponent implements OnInit {

  config: HomePageConfigDto | null = null;
  categories: CategoryDto[] = [];
  products: ProductDto[] = [];

  // Add to featured picker
  showAddFeatured = false;
  allProducts: ProductDto[] = [];
  productSearch = '';
  filteredProducts: ProductDto[] = [];

  categoryOrders: Record<string, number> = {};
  categoryVisibility: Record<string, boolean> = {};

  loading = false;
  savingOrder = false;

  constructor(
    private api: ApiService,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;

    this.api.getHomePageConfig().subscribe({
      next: (res) => {
        this.config = res.data ?? null;

        if (this.config?.categories) {
          for (const c of this.config.categories) {
            this.categoryOrders[c.id] = (c as any).displayOrder ?? 0;
            this.categoryVisibility[c.id] = (c as any).isVisible ?? true;
          }
        }

        this.loadCategories();
        this.loadFeaturedProducts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.sortCategories();
        this.loading = false;
      }
    });
  }

  loadFeaturedProducts(): void {
    this.api.getFeaturedProducts({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.products = res.data?.data ?? [];
      }
    });
  }

  sortCategories(): void {
    this.categories.sort(
      (a, b) =>
        (this.categoryOrders[a.id] ?? 0) -
        (this.categoryOrders[b.id] ?? 0)
    );
  }

  getCatOrder(catId: string): number {
    return this.categoryOrders[catId] ?? 0;
  }

  getCatVisible(catId: string): boolean {
    return this.categoryVisibility[catId] ?? true;
  }

  // ===== DRAG & DROP =====
  dropCategory(event: CdkDragDrop<CategoryDto[]>): void {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);

    this.categories.forEach((cat, index) => {
      this.categoryOrders[cat.id] = index + 1;
    });

    this.saveAllCategoryOrders();
  }

  saveAllCategoryOrders(): void {
    this.savingOrder = true;

    let completed = 0;
    const total = this.categories.length;

    for (const cat of this.categories) {
      const data: UpdateCategoryOrderDto = {
        categoryId: cat.id,
        displayOrder: this.categoryOrders[cat.id] ?? 0,
        isVisible: this.categoryVisibility[cat.id] ?? true
      };

      this.api.updateCategoryOrder(data).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.savingOrder = false;
            this.toast.success(
              this.i18n.lang === 'ar'
                ? 'تم تحديث الترتيب'
                : 'Order updated'
            );
          }
        },
        error: () => {
          completed++;
          if (completed === total) {
            this.savingOrder = false;
          }
        }
      });
    }
  }

  toggleCategoryVisible(catId: string, visible: boolean): void {
    this.categoryVisibility[catId] = visible;

    const data: UpdateCategoryOrderDto = {
      categoryId: catId,
      displayOrder: this.categoryOrders[catId] ?? 0,
      isVisible: visible
    };

    this.api.updateCategoryOrder(data).subscribe({
      next: () =>
        this.toast.success(
          this.i18n.lang === 'ar' ? 'تم التحديث' : 'Updated'
        ),
      error: () =>
        this.toast.error(
          this.i18n.lang === 'ar' ? 'فشل التحديث' : 'Failed'
        )
    });
  }

  toggleFeatured(productId: string, isFeatured: boolean): void {
    const data: UpdateFeaturedProductDto = {
      productId,
      isFeatured,
      isPinned: false,
      displayOrder: 0
    };

    this.api.updateFeaturedProduct(data).subscribe({
      next: () => {
        this.toast.success(
          isFeatured
            ? (this.i18n.lang === 'ar' ? 'تم التمييز' : 'Featured')
            : (this.i18n.lang === 'ar' ? 'تم إلغاء التمييز' : 'Unfeatured')
        );
        this.loadInitialData();
      },
      error: () =>
        this.toast.error(
          this.i18n.lang === 'ar' ? 'فشل التحديث' : 'Failed'
        )
    });
  }

  // ===== FEATURED PRODUCTS DRAG & DROP =====
  dropProduct(event: CdkDragDrop<ProductDto[]>): void {
    moveItemInArray(this.products, event.previousIndex, event.currentIndex);
    this.saveFeaturedOrder();
  }

  saveFeaturedOrder(): void {
    const payload = {
      items: this.products.map((p, index) => ({
        productId: p.id,
        displayOrder: index + 1
      }))
    };

    this.api.updateFeaturedProductsOrder(payload).subscribe({
      next: () => {
        this.toast.success(
          this.i18n.lang === 'ar' ? 'تم تحديث ترتيب المنتجات المميزة' : 'Featured products order updated'
        );
      },
      error: () => {
        this.toast.error(
          this.i18n.lang === 'ar' ? 'فشل تحديث الترتيب' : 'Failed to update order'
        );
      }
    });
  }

  // ===== ADD PRODUCT TO FEATURED =====
  openAddFeatured(): void {
    this.showAddFeatured = true;
    this.productSearch = '';
    this.filteredProducts = [];
    this.loadAllProducts();
  }

  closeAddFeatured(): void {
    this.showAddFeatured = false;
    this.productSearch = '';
    this.filteredProducts = [];
  }

  loadAllProducts(): void {
    this.api.getProducts({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        this.allProducts = res.data?.data ?? [];
      }
    });
  }

  onProductSearch(): void {
    const keyword = this.productSearch.trim().toLowerCase();
    if (!keyword) {
      this.filteredProducts = [];
      return;
    }
    const featuredIds = new Set(this.products.map(p => p.id));
    this.filteredProducts = this.allProducts
      .filter(p =>
        !featuredIds.has(p.id) &&
        (p.nameAr.toLowerCase().includes(keyword) ||
         (p.nameEn ?? '').toLowerCase().includes(keyword) ||
         (p.barcode ?? '').includes(keyword))
      )
      .slice(0, 10);
  }

  addToFeatured(product: ProductDto): void {
    const data: UpdateFeaturedProductDto = {
      productId: product.id,
      isFeatured: true,
      isPinned: false,
      displayOrder: this.products.length + 1
    };

    this.api.updateFeaturedProduct(data).subscribe({
      next: () => {
        this.toast.success(
          this.i18n.lang === 'ar' ? 'تم إضافة المنتج للمميز' : 'Product added to featured'
        );
        this.closeAddFeatured();
        this.loadFeaturedProducts();
      },
      error: () => {
        this.toast.error(
          this.i18n.lang === 'ar' ? 'فشل الإضافة' : 'Failed to add'
        );
      }
    });
  }
}
