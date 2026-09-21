import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserDto, OrderDto } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  selectedUser: UserDto | null = null;
  userOrders: OrderDto[] = [];
  showOrders = false;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.toast.error(this.i18n.lang === 'ar' ? 'فشل تحميل المستخدمين' : 'Failed to load users');
        this.loading = false;
      }
    });
  }

  viewOrders(user: UserDto): void {
    this.selectedUser = user;
    this.showOrders = true;
    this.api.getUserOrders(user.id).subscribe({
      next: (res) => {
        this.userOrders = res.data ?? [];
      },
      error: () => {
        this.userOrders = [];
      }
    });
  }

  toggleBlock(user: UserDto): void {
    this.api.toggleUserBlock(user.id).subscribe({
      next: () => {
        user.isBlocked = !user.isBlocked;
        this.toast.success(user.isBlocked
          ? (this.i18n.lang === 'ar' ? 'تم حظر المستخدم' : 'User blocked')
          : (this.i18n.lang === 'ar' ? 'تم إلغاء الحظر' : 'User unblocked'));
      },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل تنفيذ العملية' : 'Operation failed')
    });
  }

  toggleFlag(user: UserDto): void {
    this.api.toggleUserFlag(user.id).subscribe({
      next: () => {
        user.isFlagged = !user.isFlagged;
        this.toast.success(user.isFlagged
          ? (this.i18n.lang === 'ar' ? 'تم تحذير المستخدم' : 'User flagged')
          : (this.i18n.lang === 'ar' ? 'تم إلغاء التحذير' : 'Flag removed'));
      },
      error: () => this.toast.error(this.i18n.lang === 'ar' ? 'فشل تنفيذ العملية' : 'Operation failed')
    });
  }

  closeOrders(): void {
    this.showOrders = false;
    this.selectedUser = null;
    this.userOrders = [];
  }

  getStatusClass(user: UserDto): string {
    if (user.isBlocked) return 'text-danger';
    if (user.isFlagged) return 'text-warning';
    return 'text-success';
  }

  statusLabel(status: number): string {
    const labels = ['Pending', 'Completed', 'Failed', 'Processing', 'Delivered', 'Returned', 'Cancelled'];
    return labels[status] || 'Unknown';
  }
}
