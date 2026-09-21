import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-order-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-order-create.component.html',
  styleUrls: ['./admin-order-create.component.css']
})
export class AdminOrderCreateComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  orderItems: any[] = [];
  customerPhone = '';
  customerAddress = '';
  notes = '';
  deliveryFee = 0;               // أصبحت القيمة الافتراضية صفر
  barcodeScan = '';
  productSearch = '';
  loading = false;
  success = false;
  showProductPicker = false;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.setDefaultCustomerInfo();
    this.loadProducts();
  }

  private setDefaultCustomerInfo(): void {
    // رقم الهاتف الافتراضي للمحل
    this.customerPhone = '01200289439';
    // العنوان الافتراضي حسب اللغة (متجر المدينة المنورة)
    this.customerAddress = this.i18n.lang === 'ar' ? 'متجر المدينة المنورة' : 'Al Madinah Store';
  }

  loadProducts(): void {
    this.api.getProducts({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (res) => {
        this.products = res.data?.data ?? [];
        this.filteredProducts = this.products;
      }
    });
  }

  onBarcodeScan(event: any): void {
    const barcode = event.target.value.trim();
    if (!barcode) return;
    const product = this.products.find((p: any) => p.barcode === barcode);
    if (product) {
      this.addToOrder(product);
    } else {
      this.toast.warning(this.i18n.lang === 'ar' ? 'المنتج غير موجود: ' + barcode : 'Product not found: ' + barcode);
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
    this.filteredProducts = this.products.filter((p: any) => {
      const nameAr = (p.nameAr || '').toLowerCase();
      const nameEn = (p.nameEn || '').toLowerCase();
      const barcode = (p.barcode || '').toLowerCase();
      return nameAr.includes(term) || nameEn.includes(term) || barcode.includes(term);
    });
    this.showProductPicker = this.filteredProducts.length > 0;
  }

  selectProduct(product: any): void {
    this.addToOrder(product);
    this.productSearch = '';
    this.showProductPicker = false;
    this.filteredProducts = this.products;
  }

  addToOrder(product: any): void {
    const existing = this.orderItems.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += 1;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      this.orderItems.push({
        productId: product.id,
        productName: this.i18n.lang === 'en' ? (product.nameEn || product.nameAr) : product.nameAr,
        productImage: product.imageUrl,
        quantity: 1,
        unitPrice: product.finalPrice ?? product.price,
        totalPrice: product.finalPrice ?? product.price
      });
    }
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
  }

  changeQty(index: number, delta: number): void {
    const item = this.orderItems[index];
    item.quantity += delta;
    if (item.quantity < 1) item.quantity = 1;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  get subtotal(): number {
    return this.orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  confirmOrder(): void {
    if (!this.orderItems.length) {
      this.toast.warning(this.i18n.lang === 'ar' ? 'أضف منتجات للطلب أولاً.' : 'Add products to the order first.');
      return;
    }
    if (!this.customerPhone.trim() || !this.customerAddress.trim()) {
      this.toast.warning(this.i18n.lang === 'ar' ? 'أدخل الهاتف والعنوان.' : 'Enter phone and address.');
      return;
    }

    this.loading = true;
    const items = this.orderItems.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    }));

    this.api.createInStoreOrder({ items, notes: this.notes }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.toast.success(this.i18n.lang === 'ar' ? 'تم إنشاء الطلب' : 'Order created');
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل تأكيد الطلب.' : 'Failed to confirm order.');
      }
    });
  }

  printInvoice(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dir = this.i18n.lang === 'ar' ? 'rtl' : 'ltr';
    const itemsHtml = this.orderItems.map(i => `
      <tr>
        <td>${i.productName}</td>
        <td>${i.quantity}</td>
        <td>${i.unitPrice} EGP</td>
        <td>${i.totalPrice} EGP</td>
      </tr>
    `).join('');

    const html = `
      <html dir="${dir}">
      <head><title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
        th { background: #f5f5f5; }
        .total { font-size: 1.3rem; font-weight: bold; margin-top: 20px; text-align: ${dir === 'rtl' ? 'left' : 'right'}; }
        .header { text-align: center; margin-bottom: 20px; }
        .info { margin-bottom: 15px; }
        .info p { margin: 4px 0; }
      </style>
      </head>
      <body>
        <div class="header">
          <h2>AL MADINA</h2>
          <p>Invoice #${Date.now()}</p>
        </div>
        <div class="info">
          <p><strong>Phone:</strong> ${this.customerPhone}</p>
          <p><strong>Address:</strong> ${this.customerAddress}</p>
          <p><strong>Notes:</strong> ${this.notes || '-'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="total">
          <p>Subtotal: ${this.subtotal} EGP</p>
          <p>Delivery: ${this.deliveryFee} EGP</p>
          <p>Total: ${this.total} EGP</p>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  reset(): void {
    this.orderItems = [];
    this.notes = '';
    this.deliveryFee = 0;               // إعادة التعيين إلى صفر
    this.barcodeScan = '';
    this.productSearch = '';
    this.success = false;
    this.showProductPicker = false;
    // إعادة تعيين معلومات العميل إلى القيم الافتراضية
    this.setDefaultCustomerInfo();
  }
}