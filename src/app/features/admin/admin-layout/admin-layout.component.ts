import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, LanguageSwitcherComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  constructor(public i18n: I18nService) {}

  menu = [
    { label: 'dashboard', icon: '📊', route: '/admin/dashboard' },
    { label: 'products', icon: '📦', route: '/admin/products' },
    { label: 'categories', icon: '🏷️', route: '/admin/categories' },
    { label: 'orders', icon: '🛒', route: '/admin/orders' },
    { label: 'users', icon: '👥', route: '/admin/users' },
    { label: 'returns', icon: '↩️', route: '/admin/returns' },
    { label: 'deals', icon: '🔥', route: '/admin/deals' },
    { label: 'stock', icon: '📈', route: '/admin/stock' },
    { label: 'homePage', icon: '🏠', route: '/admin/home-page' },
    { label: 'store', icon: '🏬', route: '/' }
  ];
}
