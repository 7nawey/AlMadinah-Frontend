import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { StockMovementDto, ProductDto, CreateStockMovementDto, CreateStockMovementWithNewProductDto } from '../../../core/models';

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-stock.component.html',
  styleUrls: ['./admin-stock.component.css']
})
export class AdminStockComponent implements OnInit {
  movements: StockMovementDto[] = [];
  products: ProductDto[] = [];
  categories: { id: string; nameAr: string }[] = [];
  loading = false;
  showForm = false;
  mode: 'existing' | 'new' = 'existing';

  // Barcode
  barcodeScan = '';

  // Existing product form
  existingForm = {
    productId: '',
    quantity: 0,
    unitCost: 0,
    supplier: '',
    notes: ''
  };

  // New product form
  newProductForm = {
    nameAr: '',
    nameEn: '',
    barcode: '',
    description: '',
    price: 0,
    costPrice: 0,
    initialStock: 0,
    categoryId: '',
    unitCost: 0,
    supplier: '',
    notes: ''
  };

  // Search
  productSearch = '';
  filteredProducts: ProductDto[] = [];
  showProductPicker = false;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadMovements();
    this.loadProducts();
    this.loadCategories();
  }

  loadMovements(): void {
    this.loading = true;
    this.api.getStockMovements().subscribe({
      next: (res) => { this.movements = res.data ?? []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadProducts(): void {
    this.api.getProducts({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (res) => { this.products = res.data?.data ?? []; this.filteredProducts = this.products; }
    });
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res) => { this.categories = (res.data ?? []).map(c => ({ id: c.id, nameAr: c.nameAr })); }
    });
  }

  openAddExisting(): void {
    this.showForm = true;
    this.mode = 'existing';
    this.existingForm = { productId: '', quantity: 0, unitCost: 0, supplier: '', notes: '' };
    this.barcodeScan = '';
  }

  openAddNew(): void {
    this.showForm = true;
    this.mode = 'new';
    this.newProductForm = { nameAr: '', nameEn: '', barcode: '', description: '', price: 0, costPrice: 0, initialStock: 0, categoryId: '', unitCost: 0, supplier: '', notes: '' };
  }

  closeForm(): void {
    this.showForm = false;
    this.productSearch = '';
    this.showProductPicker = false;
  }

  onBarcodeScan(event: any): void {
    const barcode = event.target.value.trim();
    if (!barcode) return;
    const product = this.products.find(p => p.barcode === barcode);
    if (product) {
      this.existingForm.productId = product.id;
      this.toast.success(this.i18n.lang === 'ar' ? 'تم العثور على المنتج' : 'Product found');
    } else {
      this.toast.warning(this.i18n.lang === 'ar' ? 'المنتج غير موجود، سيتم إنشاؤه' : 'Product not found, will create new');
      this.newProductForm.barcode = barcode;
      this.mode = 'new';
    }
    this.barcodeScan = '';
  }

  onProductSearch(): void {
    const term = this.productSearch.trim().toLowerCase();
    if (!term) {
      this.filteredProducts = this.products;
      this.showProductPicker = false;
      return;
    }
    this.filteredProducts = this.products.filter(p =>
      (p.nameAr || '').toLowerCase().includes(term) ||
      (p.nameEn || '').toLowerCase().includes(term) ||
      (p.barcode || '').toLowerCase().includes(term)
    );
    this.showProductPicker = this.filteredProducts.length > 0;
  }

  selectProduct(product: ProductDto): void {
    this.existingForm.productId = product.id;
    this.productSearch = '';
    this.showProductPicker = false;
  }

  getSelectedProductName(): string {
    const p = this.products.find(pr => pr.id === this.existingForm.productId);
    return p?.nameAr || '';
  }

  getTotalCost(): number {
    if (this.mode === 'existing') {
      return (this.existingForm.quantity || 0) * (this.existingForm.unitCost || 0);
    }
    return (this.newProductForm.initialStock || 0) * (this.newProductForm.unitCost || 0);
  }

  saveExisting(): void {
    if (!this.existingForm.productId || this.existingForm.quantity <= 0) {
      this.toast.warning(this.i18n.lang === 'ar' ? 'اختر منتجاً وأدخل كمية صحيحة' : 'Select a product and enter a valid quantity');
      return;
    }
    const data: CreateStockMovementDto = {
      productId: this.existingForm.productId,
      quantity: this.existingForm.quantity,
      unitCost: this.existingForm.unitCost || undefined,
      supplier: this.existingForm.supplier || undefined,
      notes: this.existingForm.notes || undefined
    };
    this.api.addStockMovement(data).subscribe({
      next: () => {
        this.toast.success(this.i18n.lang === 'ar' ? 'تم تسجيل الحركة' : 'Movement recorded');
        this.closeForm();
        this.loadMovements();
      },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل التسجيل' : 'Failed')
    });
  }

  saveNewProduct(): void {
    if (!this.newProductForm.nameAr || this.newProductForm.initialStock <= 0) {
      this.toast.warning(this.i18n.lang === 'ar' ? 'أدخل الاسم والكمية' : 'Enter name and quantity');
      return;
    }
    const data: CreateStockMovementWithNewProductDto = {
      nameAr: this.newProductForm.nameAr,
      nameEn: this.newProductForm.nameEn || this.newProductForm.nameAr,
      description: this.newProductForm.description || undefined,
      barcode: this.newProductForm.barcode || undefined,
      price: this.newProductForm.price,
      costPrice: this.newProductForm.costPrice,
      initialStock: this.newProductForm.initialStock,
      categoryId: this.newProductForm.categoryId || undefined,
      unitCost: this.newProductForm.unitCost || undefined,
      supplier: this.newProductForm.supplier || undefined,
      notes: this.newProductForm.notes || undefined
    };
    this.api.addStockMovementWithNewProduct(data).subscribe({
      next: () => {
        this.toast.success(this.i18n.lang === 'ar' ? 'تم إنشاء المنتج وتسجيل الحركة' : 'Product created and movement recorded');
        this.closeForm();
        this.loadMovements();
        this.loadProducts();
      },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل الإنشاء' : 'Failed')
    });
  }
}
