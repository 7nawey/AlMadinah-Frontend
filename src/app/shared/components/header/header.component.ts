import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ApiService } from '../../../core/services/api.service';
import { ProductDto } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, CommonModule, LanguageSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']   // تمت الإضافة
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchKeyword = '';
  orderCount = 0;
  isMenuOpen = false;
  showSearchDropdown = false;
  searchResults: ProductDto[] = [];
  selectedIndex = -1;
  barcodeMode = false;

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private searchCache = new Map<string, ProductDto[]>();

  get isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === 'Admin';
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  constructor(private router: Router, public i18n: I18nService, private api: ApiService) {
    this.updateOrderCount();
    window.addEventListener('storage', () => this.updateOrderCount());
  }

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(keyword => {
      this.performSearch(keyword);
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  updateOrderCount(): void {
    const order = JSON.parse(localStorage.getItem('currentOrder') || '[]');
    this.orderCount = order.length;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentOrder');
    this.router.navigate(['/']);
  }

  onSearchInput(): void {
    const keyword = this.searchKeyword.trim();
    if (!keyword) {
      this.showSearchDropdown = false;
      this.searchResults = [];
      this.selectedIndex = -1;
      return;
    }
    if (keyword.length < 2) {
      this.showSearchDropdown = false;
      return;
    }
    this.searchSubject.next(keyword);
  }

  performSearch(keyword: string): void {
    if (this.searchCache.has(keyword)) {
      this.searchResults = this.searchCache.get(keyword)!;
      this.showSearchDropdown = this.searchResults.length > 0;
      this.selectedIndex = -1;
      return;
    }

    this.api.searchProducts(keyword).subscribe({
      next: (res) => {
        this.searchResults = (res.data?.data ?? []).slice(0, 8);
        this.showSearchDropdown = this.searchResults.length > 0;
        this.selectedIndex = -1;
        this.searchCache.set(keyword, this.searchResults);
        if (this.searchCache.size > 20) {
          const firstKey = Array.from(this.searchCache.keys())[0];
          if (firstKey !== undefined) {
            this.searchCache.delete(firstKey);
          }
        }
      },
      error: () => {
        this.searchResults = [];
        this.showSearchDropdown = false;
        this.selectedIndex = -1;
      }
    });
  }

  // Enter / search button:
  // - exact barcode match -> go straight to the product
  // - otherwise -> open the search results page with near matches
  submitSearch(): void {
    const keyword = this.searchKeyword.trim();
    if (!keyword) return;
    this.showSearchDropdown = false;
    this.selectedIndex = -1;

    const finish = (products: ProductDto[]) => {
      const exactBarcode = products.find(p => p.barcode === keyword);
      this.searchKeyword = '';
      if (exactBarcode) {
        this.goToProduct(exactBarcode.id);
      } else {
        this.router.navigate(['/products/search'], { queryParams: { keyword } });
      }
    };

    if (this.searchCache.has(keyword)) {
      finish(this.searchCache.get(keyword)!);
      return;
    }
    this.api.searchProducts(keyword).subscribe({
      next: (res) => finish(res.data?.data ?? []),
      error: () => {
        this.searchKeyword = '';
        this.router.navigate(['/products/search'], { queryParams: { keyword } });
      }
    });
  }

  goToProduct(id: string): void {
    this.showSearchDropdown = false;
    this.searchKeyword = '';
    this.selectedIndex = -1;
    this.router.navigate(['/product', id]);
  }

  selectResult(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.searchResults.length) {
      this.goToProduct(this.searchResults[this.selectedIndex].id);
    }
  }

  closeSearch(): void {
    this.showSearchDropdown = false;
    this.selectedIndex = -1;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const targetId = (event.target as HTMLElement)?.id;

    // Dropdown closed: Enter inside the search box still submits
    if (!this.showSearchDropdown) {
      if (event.key === 'Enter' && targetId === 'searchInput') {
        event.preventDefault();
        this.submitSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        // Arrow-selected suggestion -> product page, otherwise -> results page / barcode match
        if (this.selectedIndex >= 0) {
          this.selectResult();
        } else {
          this.submitSearch();
        }
        break;
      case 'Escape':
        this.closeSearch();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-wrapper')) {
      this.closeSearch();
    }
  }

  onBarcodeInput(event: any): void {
    const barcode = event.target.value.trim();
    if (!barcode) return;
    this.api.searchProducts(barcode).subscribe({
      next: (res) => {
        const products = res.data?.data ?? [];
        const found = products.find((p: ProductDto) => p.barcode === barcode);
        if (found) {
          this.searchKeyword = '';
          this.barcodeMode = false;
          this.goToProduct(found.id);
        } else {
          this.searchResults = products.slice(0, 8);
          this.showSearchDropdown = this.searchResults.length > 0;
          this.selectedIndex = this.searchResults.length > 0 ? 0 : -1;
        }
      }
    });
  }

  toggleBarcodeMode(): void {
    this.barcodeMode = !this.barcodeMode;
    this.showSearchDropdown = false;
    if (this.barcodeMode) {
      setTimeout(() => {
        const el = document.getElementById('barcodeInput');
        el?.focus();
      }, 100);
    } else {
      setTimeout(() => {
        const el = document.getElementById('searchInput');
        el?.focus();
      }, 100);
    }
  }

  getProductName(p: ProductDto): string {
    return this.i18n.lang === 'en' ? (p.nameEn || p.nameAr) : p.nameAr;
  }

  isSelected(index: number): boolean {
    return this.selectedIndex === index;
  }
}