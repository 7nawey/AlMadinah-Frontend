import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationAssistantService } from '../../../core/services/translation-assistant.service';
import { ProductDto, CategoryDto, CreateProductDto, UpdateProductDto } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: ProductDto[] = [];
  filteredProducts: ProductDto[] = [];
  categories: CategoryDto[] = [];
  loading = false;
  showForm = false;
  editing = false;
  searchQuery = '';
  barcodeScan = '';

  form = {
    id: '',
    nameAr: '',
    nameEn: '',
    barcode: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    categoryName: '',
    isActive: true,
    image: null as File | null
  };

  // Translation suggestions
  nameArSuggestion = '';
  nameEnSuggestion = '';

  constructor(
    private api: ApiService,
    public i18n: I18nService,
    private router: Router,
    private toast: ToastService,
    private translation: TranslationAssistantService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  onNameArChange(): void {
    this.nameEnSuggestion = this.translation.getSuggestion(this.form.nameAr, this.form.nameEn);
  }

  onNameEnChange(): void {
    this.nameArSuggestion = this.translation.getSuggestion(this.form.nameEn, this.form.nameAr);
  }

  applySuggestion(field: 'ar' | 'en'): void {
    if (field === 'en' && this.nameEnSuggestion) {
      this.form.nameEn = this.nameEnSuggestion;
      this.nameEnSuggestion = '';
    } else if (field === 'ar' && this.nameArSuggestion) {
      this.form.nameAr = this.nameArSuggestion;
      this.nameArSuggestion = '';
    }
  }

  clearSuggestion(field: 'ar' | 'en'): void {
    if (field === 'en') this.nameEnSuggestion = '';
    else this.nameArSuggestion = '';
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getProducts({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        this.products = res.data?.data ?? [];
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        p.nameAr?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q)
      );
    }
  }

  onBarcodeScan(event: any): void {
    const barcode = event.target.value.trim();
    if (!barcode) return;
    const found = this.products.find(p => p.barcode === barcode);
    if (found) {
      this.edit(found);
    } else {
      this.openAdd();
      this.form.barcode = barcode;
    }
    this.barcodeScan = '';
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => { this.categories = res.data ?? []; }
    });
  }

  openAdd(): void {
    this.showForm = true;
    this.editing = false;
    this.form = { id: '', nameAr: '', nameEn: '', barcode: '', price: 0, costPrice: 0, stockQuantity: 0, categoryName: '', isActive: true, image: null };
    this.nameArSuggestion = '';
    this.nameEnSuggestion = '';
  }

  edit(p: ProductDto): void {
    this.showForm = true;
    this.editing = true;
    this.form = {
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn || '',
      barcode: p.barcode || '',
      price: p.price,
      costPrice: p.costPrice,
      stockQuantity: p.stockQuantity,
      categoryName: p.categoryName || '',
      isActive: p.isActive,
      image: null
    };
    this.nameArSuggestion = '';
    this.nameEnSuggestion = '';
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.form.image = file;
  }

  save(): void {
    if (this.editing) {
      const data: UpdateProductDto = {
        id: this.form.id,
        nameAr: this.form.nameAr,
        nameEn: this.form.nameEn || this.form.nameAr,
        barcode: this.form.barcode || undefined,
        price: this.form.price,
        costPrice: this.form.costPrice,
        stockQuantity: this.form.stockQuantity,
        categoryName: this.form.categoryName || undefined,
        isActive: this.form.isActive
      };
      this.api.updateProduct(this.form.id, data).subscribe({
        next: () => {
          if (this.form.image) {
            this.api.uploadProductImage(this.form.id, this.form.image).subscribe({
              next: () => { this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم التحديث' : 'Updated'); },
              error: () => { this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم التحديث (بدون صورة)' : 'Updated (no image)'); }
            });
          } else {
            this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم التحديث' : 'Updated');
          }
        },
        error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل التحديث' : 'Failed')
      });
    } else {
      const data: CreateProductDto = {
        nameAr: this.form.nameAr,
        nameEn: this.form.nameEn || this.form.nameAr,
        barcode: this.form.barcode || undefined,
        price: this.form.price,
        costPrice: this.form.costPrice,
        stockQuantity: this.form.stockQuantity,
        categoryName: this.form.categoryName || undefined
      };
      this.api.createProduct(data).subscribe({
        next: (res) => {
          const newId = res.data?.id;
          if (newId && this.form.image) {
            this.api.uploadProductImage(newId, this.form.image).subscribe({
              next: () => { this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الإنشاء' : 'Created'); },
              error: () => { this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الإنشاء (بدون صورة)' : 'Created (no image)'); }
            });
          } else {
            this.showForm = false; this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الإنشاء' : 'Created');
          }
        },
        error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الإنشاء' : 'Failed')
      });
    }
  }

  delete(id: string): void {
    if (!confirm(this.i18n.lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    this.api.deleteProduct(id).subscribe({
      next: () => { this.loadProducts(); this.toast.success(this.i18n.lang === 'ar' ? 'تم الحذف' : 'Deleted'); },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الحذف' : 'Failed')
    });
  }
}
