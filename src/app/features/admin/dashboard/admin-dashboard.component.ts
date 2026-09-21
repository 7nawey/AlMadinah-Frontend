import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DashboardStatsDto, BestSellingProductDto, MostProfitableProductDto, RecentOrderDto, SalesChartDataDto } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStatsDto | null = null;
  bestSelling: BestSellingProductDto[] = [];
  mostProfitable: MostProfitableProductDto[] = [];
  recentOrders: RecentOrderDto[] = [];
  salesChart: SalesChartDataDto[] = [];
  loading = true;
  error = false;

  constructor(private api: ApiService, public i18n: I18nService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;

    this.api.getDashboardStats().subscribe({
      next: (res) => { this.stats = res.data ?? null; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });

    this.api.getDashboardBestSelling().subscribe({
      next: (res) => { this.bestSelling = res.data ?? []; }
    });

    this.api.getDashboardMostProfitable().subscribe({
      next: (res) => { this.mostProfitable = res.data ?? []; }
    });

    this.api.getDashboardRecentOrders().subscribe({
      next: (res) => { this.recentOrders = res.data ?? []; }
    });

    this.api.getDashboardSalesChart(30).subscribe({
      next: (res) => { this.salesChart = res.data ?? []; }
    });
  }

  getMaxRevenue(): number {
    if (!this.salesChart.length) return 1;
    return Math.max(...this.salesChart.map(d => d.revenue));
  }
}
