import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { OrderDto, OrderStatus } from '../../core/models';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css']
})
export class UserOrdersComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = false;
  selectedOrder: OrderDto | null = null;

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.api.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  statusLabel(status: OrderStatus): string {
    const map: Record<number, string> = {
      [OrderStatus.PendingPayment]: this.i18n.lang === 'ar' ? 'في انتظار الدفع' : 'Pending Payment',
      [OrderStatus.Paid]: this.i18n.lang === 'ar' ? 'مدفوع' : 'Paid',
      [OrderStatus.Failed]: this.i18n.lang === 'ar' ? 'فاشل' : 'Failed',
      [OrderStatus.Processing]: this.i18n.lang === 'ar' ? 'قيد المعالجة' : 'Processing',
      [OrderStatus.Delivered]: this.i18n.lang === 'ar' ? 'تم التوصيل' : 'Delivered',
      [OrderStatus.Returned]: this.i18n.lang === 'ar' ? 'مرتجع' : 'Returned',
      [OrderStatus.Cancelled]: this.i18n.lang === 'ar' ? 'ملغي' : 'Cancelled'
    };
    return map[status] ?? (this.i18n.lang === 'ar' ? 'غير معروف' : 'Unknown');
  }

  statusClass(status: OrderStatus): string {
    const map: Record<number, string> = {
      [OrderStatus.PendingPayment]: 'bg-warning text-dark',
      [OrderStatus.Paid]: 'bg-success',
      [OrderStatus.Failed]: 'bg-danger',
      [OrderStatus.Processing]: 'bg-info text-dark',
      [OrderStatus.Delivered]: 'bg-primary',
      [OrderStatus.Returned]: 'bg-secondary',
      [OrderStatus.Cancelled]: 'bg-dark'
    };
    return map[status] ?? 'bg-light text-dark';
  }

  typeLabel(type: number): string {
    return type === 1
      ? (this.i18n.lang === 'ar' ? 'جملة' : 'Wholesale')
      : (this.i18n.lang === 'ar' ? 'تجزئة' : 'Retail');
  }

  selectOrder(order: OrderDto): void {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }
}
