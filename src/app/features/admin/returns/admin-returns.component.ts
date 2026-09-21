import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderDto, ReturnRequestDto, CreateReturnRequestDto, CreateReturnItemDto } from '../../../core/models';

@Component({
  selector: 'app-admin-returns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-returns.component.html',
  styleUrls: ['./admin-returns.component.css']
})
export class AdminReturnsComponent implements OnInit {
  returns: ReturnRequestDto[] = [];
  orders: OrderDto[] = [];
  loading = false;
  showCreate = false;

  // Create return form
  selectedOrder: OrderDto | null = null;
  returnItems: { orderItemId: string; productId: string; productName: string; maxQty: number; qty: number; selected: boolean }[] = [];
  isFullReturn = false;
  createLoading = false;

  // Filters
  searchOrderId = '';
  searchCustomer = '';
  filterDate = '';
  filterProduct = '';

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadReturns();
    this.loadOrders();
  }

  loadReturns(): void {
    this.loading = true;
    this.api.getAllReturns().subscribe({
      next: (res) => {
        this.returns = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل تحميل المرتجعات' : 'Failed to load returns');
        this.loading = false;
      }
    });
  }

  loadOrders(): void {
    this.api.getOrders().subscribe({
      next: (res) => {
        this.orders = (res.data ?? []).filter(o => o.status === 1 || o.status === 3 || o.status === 4); // Paid, Processing, Delivered
      }
    });
  }

  get filteredReturns(): ReturnRequestDto[] {
    let result = [...this.returns];
    if (this.searchOrderId) {
      result = result.filter(r => r.orderId.toLowerCase().includes(this.searchOrderId.toLowerCase()));
    }
    if (this.filterDate) {
      const d = new Date(this.filterDate).toDateString();
      result = result.filter(r => new Date(r.createdAt).toDateString() === d);
    }
    return result;
  }

  openCreate(): void {
    this.showCreate = true;
    this.selectedOrder = null;
    this.returnItems = [];
    this.isFullReturn = false;
  }

  closeCreate(): void {
    this.showCreate = false;
    this.selectedOrder = null;
    this.returnItems = [];
  }

  selectOrder(order: OrderDto): void {
    this.selectedOrder = order;
    this.returnItems = order.items.map(item => ({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      maxQty: item.quantity,
      qty: item.quantity,
      selected: false
    }));
    this.isFullReturn = false;
  }

  toggleFullReturn(): void {
    this.isFullReturn = !this.isFullReturn;
    for (const item of this.returnItems) {
      item.selected = this.isFullReturn;
      item.qty = this.isFullReturn ? item.maxQty : 1;
    }
  }

  get selectedReturnItems() {
    return this.returnItems.filter(i => i.selected && i.qty > 0);
  }

  get canSubmit(): boolean {
    return this.selectedReturnItems.length > 0 && this.selectedOrder !== null;
  }

  submitReturn(): void {
    if (!this.canSubmit || !this.selectedOrder) return;
    this.createLoading = true;

    const items: CreateReturnItemDto[] = this.selectedReturnItems.map(i => ({
      orderItemId: i.orderItemId,
      quantity: i.qty
    }));

    const data: CreateReturnRequestDto = {
      orderId: this.selectedOrder.id,
      items
    };

    this.api.createReturn(data).subscribe({
      next: () => {
        this.createLoading = false;
        this.toast.success(this.i18n.lang === 'ar' ? 'تم إنشاء المرتجع' : 'Return created');
        this.closeCreate();
        this.loadReturns();
        this.loadOrders();
      },
      error: () => {
        this.createLoading = false;
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل إنشاء المرتجع' : 'Failed to create return');
      }
    });
  }
}
