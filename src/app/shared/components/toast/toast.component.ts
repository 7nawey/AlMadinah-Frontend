import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { toastAnimation } from '../../../core/animations/app.animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [toastAnimation],
  template: `
    <div class="toast-container" [class.rtl]="i18n.lang === 'ar'">
      <div
        *ngFor="let toast of toastService.toasts | async"
        [@toastAnimation]
        class="toast toast-{{toast.type}}"
        (click)="toastService.remove(toast.id)"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id); $event.stopPropagation()">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast-container.rtl {
      right: auto;
      left: 20px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 10px;
      color: white;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      backdrop-filter: blur(10px);
    }
    .toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .toast-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .toast-info { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .toast-icon { font-size: 18px; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService, public i18n: I18nService) {}

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '!';
      default: return 'i';
    }
  }
}
