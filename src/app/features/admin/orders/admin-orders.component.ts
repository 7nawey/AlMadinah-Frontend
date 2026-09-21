import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderDto, OrderStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = false;
  selectedOrder: OrderDto | null = null;

  readonly Status = OrderStatus;

  constructor(
    private api: ApiService,
    public i18n: I18nService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  viewOrder(o: OrderDto): void {
    this.selectedOrder = o;
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  // ── Status transitions (fulfillment only, never payment) ──

  /** Start fulfillment: Paid → Processing */
  processOrder(order: OrderDto): void {
    this.api.updateOrderStatus(order.id, { orderId: order.id, status: OrderStatus.Processing, isPaid: order.isPaid }).subscribe({
      next: () => { this.loadOrders(); this.toast.success(this.i18n.t('statusUpdated')); },
      error: (err: any) => this.toast.error(err?.error?.message || this.i18n.t('updateFailed'))
    });
  }

  /** Mark as delivered: Processing → Delivered */
  markDelivered(order: OrderDto): void {
    this.api.updateOrderStatus(order.id, { orderId: order.id, status: OrderStatus.Delivered, isPaid: order.isPaid }).subscribe({
      next: () => { this.loadOrders(); this.toast.success(this.i18n.t('statusUpdated')); },
      error: (err: any) => this.toast.error(err?.error?.message || this.i18n.t('updateFailed'))
    });
  }

  /** Confirm an in-store cash order: PendingPayment → Paid + IsPaid (one atomic call) */
  confirmPayment(order: OrderDto): void {
    this.api.updateOrderStatus(order.id, { orderId: order.id, status: OrderStatus.Paid, isPaid: true }).subscribe({
      next: () => { this.loadOrders(); this.toast.success(this.i18n.t('paymentConfirmed')); },
      error: (err: any) => this.toast.error(err?.error?.message || this.i18n.t('updateFailed'))
    });
  }

  /** Cancel an order using the dedicated backend endpoint (restores stock if paid) */
  cancelOrder(order: OrderDto): void {
    if (!confirm(this.i18n.t('confirmCancelOrder'))) return;
    this.api.cancelOrder(order.id).subscribe({
      next: () => { this.loadOrders(); this.toast.success(this.i18n.t('orderCancelled')); },
      error: () => this.toast.error(this.i18n.t('cancelFailed'))
    });
  }

  /** Go to the existing Returns page */
  goToReturns(): void {
    this.router.navigate(['/admin/returns']);
  }

  // ── Conditional visibility helpers ──

  canCancel(o: OrderDto): boolean {
    return o.status === OrderStatus.PendingPayment || o.status === OrderStatus.Processing;
  }

  canConfirmPayment(o: OrderDto): boolean {
    return o.status === OrderStatus.PendingPayment && o.isInStore && !o.isPaid;
  }

  canProcess(o: OrderDto): boolean {
    return o.status === OrderStatus.Paid;
  }

  canDeliver(o: OrderDto): boolean {
    return o.status === OrderStatus.Processing;
  }

  canReturn(o: OrderDto): boolean {
    return o.status === OrderStatus.Delivered || o.status === OrderStatus.Paid;
  }

  // ── Labels ──

  statusLabel(status: OrderStatus): string {
    const map: Record<number, string> = {
      [OrderStatus.PendingPayment]: 'statusPendingPayment',
      [OrderStatus.Paid]: 'statusPaid',
      [OrderStatus.Failed]: 'statusFailed',
      [OrderStatus.Processing]: 'statusProcessing',
      [OrderStatus.Delivered]: 'statusDelivered',
      [OrderStatus.Returned]: 'statusReturned',
      [OrderStatus.Cancelled]: 'statusCancelled'
    };
    return this.i18n.t(map[status] ?? 'unknown');
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PendingPayment: return 'badge bg-warning';
      case OrderStatus.Paid: return 'badge bg-success';
      case OrderStatus.Failed: return 'badge bg-danger';
      case OrderStatus.Processing: return 'badge bg-info';
      case OrderStatus.Delivered: return 'badge bg-primary';
      case OrderStatus.Returned: return 'badge bg-secondary';
      case OrderStatus.Cancelled: return 'badge bg-dark';
      default: return 'badge bg-secondary';
    }
  }

  typeLabel(isInStore: boolean): string {
    return this.i18n.t(isInStore ? 'inStore' : 'delivery');
  }

  paymentLabel(o: OrderDto): string {
    if (o.isPaid) return this.i18n.t('paid');
    return this.i18n.t('unpaid');
  }

  /** Subtotal = sum of item totals (backend-calculated) */
  getSubtotal(o: OrderDto): number {
    return (o.items ?? []).reduce((sum, i) => sum + i.totalPrice, 0);
  }
}
