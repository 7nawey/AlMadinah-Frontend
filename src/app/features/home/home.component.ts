import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/services/toast.service';
import { fadeInUp, staggerList } from '../../core/animations/app.animations';
import { CategoryDto, ProductDto } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInUp, staggerList],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  categories: CategoryDto[] = [];
  categoryPage = 1;
  categoryPageSize = 20;
  hasMoreCategories = true;
  loadingCategories = false;
  categoriesError = false;

  featuredProducts: ProductDto[] = [];
  discountedProducts: ProductDto[] = [];
  bestSellingProducts: ProductDto[] = [];
  otherProducts: ProductDto[] = [];

  loadingFeatured = false;
  loadingDiscounted = false;
  loadingBestSelling = false;
  loadingOthers = false;

  constructor(
    private api: ApiService,
    private router: Router,
    public i18n: I18nService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories(true);
    this.loadFeatured();
    this.loadDiscounted();
    this.loadBestSelling();
    this.loadOthers();
  }

  trackByCategory(index: number, cat: CategoryDto): string { return cat.id; }
  trackByProduct(index: number, p: any): string { return p.id; }

  getProductName(p: any): string {
    return this.i18n.lang === 'en' ? (p.nameEn || p.nameAr) : p.nameAr;
  }

  getCategoryName(cat: CategoryDto): string {
    return this.i18n.lang === 'en' ? (cat.nameEn || cat.nameAr) : cat.nameAr;
  }

  loadCategories(reset: boolean = false): void {
    if (reset) {
      this.categoryPage = 1;
      this.categories = [];
      this.hasMoreCategories = true;
    }
    if (!this.hasMoreCategories || this.loadingCategories) return;

    this.loadingCategories = true;
    this.categoriesError = false;

    this.api.getCategories().subscribe({
      next: (res) => {
        const newCats = res.data ?? [];
        if (newCats.length) {
          this.categories = [...this.categories, ...newCats];
          this.categoryPage++;
          if (newCats.length < this.categoryPageSize) {
            this.hasMoreCategories = false;
          }
        } else {
          this.hasMoreCategories = false;
        }
        this.loadingCategories = false;
      },
      error: () => {
        this.categoriesError = true;
        this.loadingCategories = false;
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل تحميل التصنيفات' : 'Failed to load categories');
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.router.navigate(['/products/category', categoryId]);
  }

  loadFeatured(): void {
    this.loadingFeatured = true;
    this.api.getFeaturedProducts({ pageNumber: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.featuredProducts = res.data?.data ?? [];
        this.loadingFeatured = false;
      },
      error: () => {
        this.featuredProducts = [];
        this.loadingFeatured = false;
      }
    });
  }

  loadDiscounted(): void {
    this.loadingDiscounted = true;
    this.api.getDiscountedProducts({ pageNumber: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.discountedProducts = res.data?.data ?? [];
        this.loadingDiscounted = false;
      },
      error: () => {
        this.discountedProducts = [];
        this.loadingDiscounted = false;
      }
    });
  }

  loadBestSelling(): void {
    this.loadingBestSelling = true;
    this.api.getBestSellingProducts({ pageNumber: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.bestSellingProducts = res.data?.data ?? [];
        this.loadingBestSelling = false;
      },
      error: () => {
        this.bestSellingProducts = [];
        this.loadingBestSelling = false;
      }
    });
  }

  loadOthers(): void {
    this.loadingOthers = true;
    this.api.getHomeRegularProducts({ pageNumber: 1, pageSize: 20 }).subscribe({
      next: (res) => {
        this.otherProducts = res.data?.data ?? [];
        this.loadingOthers = false;
      },
      error: () => {
        this.otherProducts = [];
        this.loadingOthers = false;
      }
    });
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }
}
