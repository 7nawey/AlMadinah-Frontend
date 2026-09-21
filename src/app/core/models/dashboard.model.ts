export interface DashboardStatsDto {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStock: number;
}

export interface BestSellingProductDto {
  productId: string;
  nameAr: string;
  imageUrl?: string;
  totalSold: number;
  totalRevenue: number;
}

export interface MostProfitableProductDto {
  productId: string;
  nameAr: string;
  imageUrl?: string;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export interface RecentOrderDto {
  id: string;
  createdAt: string;
  totalPrice: number;
  status: number;
  isPaid: boolean;
  customerPhone: string;
  itemsCount: number;
}

export interface SalesChartDataDto {
  date: string;
  revenue: number;
  orders: number;
}
