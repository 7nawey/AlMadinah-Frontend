import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ProductDto } from '../../core/models';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  keyword = '';
  allResults: ProductDto[] = [];
  filteredResults: ProductDto[] = [];
  searchText = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      if (this.keyword) {
        this.fetchResults();
      }
    });
  }

  getProductName(p: ProductDto): string {
    return this.i18n.lang === 'en' ? (p.nameEn || p.nameAr) : p.nameAr;
  }

  fetchResults(): void {
    this.loading = true;
    this.api.searchProducts(this.keyword, { pageNumber: 1, pageSize: 60 }).subscribe({
      next: (res) => {
        this.allResults = res.data?.data ?? [];
        this.filteredResults = this.allResults;
        this.loading = false;
      },
      error: () => {
        this.allResults = [];
        this.filteredResults = [];
        this.loading = false;
      }
    });
  }

  applyLocalFilter(): void {
    const filter = this.searchText.trim().toLowerCase();
    if (!filter) {
      this.filteredResults = [...this.allResults];
    } else {
      this.filteredResults = this.allResults.filter(p =>
        (this.getProductName(p).toLowerCase().includes(filter)) ||
        (p.barcode?.toLowerCase().includes(filter))
      );
    }
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

  trackByProduct(index: number, p: ProductDto): string {
    return p.id;
  }
}
