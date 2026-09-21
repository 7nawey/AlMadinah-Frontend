import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, PagedRequest, PagedResult,
  ProductDto, CreateProductDto, UpdateProductDto,
  CategoryDto, CreateCategoryDto, UpdateCategoryDto,
  OrderDto, OrderResultDto, CreateOrderDto, CreateInStoreOrderDto, UpdateOrderStatusDto,
  UserDto, RegisterUserDto, LoginUserDto, UpdateUserDto, VerifyOtpDto,
  TokenOnlyResponse, AuthResponseDto,
  DealDto, CreateDealDto, UpdateDealDto,
  ReturnRequestDto, CreateReturnRequestDto, ProcessReturnDto,
  StockMovementDto, CreateStockMovementDto, CreateStockMovementWithNewProductDto,
  PaymobInitiatePaymentDto, PaymobInitiatePaymentResponseDto,
  DashboardStatsDto, BestSellingProductDto, MostProfitableProductDto, RecentOrderDto, SalesChartDataDto,
  HomePageConfigDto, UpdateCategoryOrderDto, UpdateFeaturedProductDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'https://localhost:7178/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ================= AUTH =================
  register(data: RegisterUserDto): Observable<ApiResponse<TokenOnlyResponse>> {
    return this.http.post<ApiResponse<TokenOnlyResponse>>(`${this.baseUrl}/auth/register`, data);
  }

  login(data: LoginUserDto): Observable<ApiResponse<TokenOnlyResponse>> {
    return this.http.post<ApiResponse<TokenOnlyResponse>>(`${this.baseUrl}/auth/login`, data);
  }

  sendOtp(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/auth/send-otp`, { email });
  }

  verifyOtp(data: VerifyOtpDto): Observable<ApiResponse<AuthResponseDto>> {
    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.baseUrl}/auth/verify-otp`, data);
  }

  googleLogin(idToken: string): Observable<ApiResponse<AuthResponseDto>> {
    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.baseUrl}/auth/google-login`, { idToken });
  }

  getProfile(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/auth/profile/${id}`, { headers: this.getAuthHeaders() });
  }

  updateProfile(data: UpdateUserDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/auth/profile`, data, { headers: this.getAuthHeaders() });
  }

  // ================= PRODUCTS =================
  getProducts(paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products`, { params });
  }

  getProductById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.http.get<ApiResponse<ProductDto>>(`${this.baseUrl}/products/${id}`);
  }

  getFeaturedProducts(paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/featured`, { params });
  }

  getDiscountedProducts(paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/discounted`, { params });
  }

  getBestSellingProducts(paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/best-selling`, { params });
  }

  searchProducts(keyword: string, paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams().set('keyword', keyword);
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/search`, { params });
  }

  getProductsByCategory(categoryId: string, paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/category/${categoryId}`, { params });
  }

  getHomeRegularProducts(paging?: PagedRequest): Observable<ApiResponse<PagedResult<ProductDto>>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<PagedResult<ProductDto>>>(`${this.baseUrl}/products/regular`, { params });
  }

  createProduct(data: CreateProductDto): Observable<ApiResponse<ProductDto>> {
    return this.http.post<ApiResponse<ProductDto>>(`${this.baseUrl}/products`, data, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: string, data: UpdateProductDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/products/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  uploadProductImage(id: string, file: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<ApiResponse<{ imageUrl: string }>>(`${this.baseUrl}/products/${id}/upload-image`, fd, { headers: this.getAuthHeaders() });
  }

  // ================= CATEGORIES =================
  // NOTE: Backend DTO has IFormFile Image, but controller uses [FromBody] which only accepts JSON.
  // To enable image upload, change [FromBody] to [FromForm] in CategoriesController Create/Update.
  // Frontend sends FormData so it will work immediately after that backend change.
  getCategories(): Observable<ApiResponse<CategoryDto[]>> {
    return this.http.get<ApiResponse<CategoryDto[]>>(`${this.baseUrl}/categories`);
  }

  getCategoryById(id: string): Observable<ApiResponse<CategoryDto>> {
    return this.http.get<ApiResponse<CategoryDto>>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(data: CreateCategoryDto, image?: File): Observable<ApiResponse<CategoryDto>> {
    const fd = new FormData();
    fd.append('nameAr', data.nameAr);
    fd.append('nameEn', data.nameEn);
    if (data.description) fd.append('description', data.description);
    if (image) fd.append('image', image);
    return this.http.post<ApiResponse<CategoryDto>>(`${this.baseUrl}/categories`, fd, { headers: this.getAuthHeaders() });
  }

  updateCategory(id: string, data: UpdateCategoryDto, image?: File): Observable<ApiResponse<void>> {
    const fd = new FormData();
    fd.append('id', id);
    fd.append('nameAr', data.nameAr);
    fd.append('nameEn', data.nameEn);
    if (data.description) fd.append('description', data.description);
    fd.append('isActive', String(data.isActive));
    if (image) fd.append('image', image);
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/categories/${id}`, fd, { headers: this.getAuthHeaders() });
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/categories/${id}`, { headers: this.getAuthHeaders() });
  }

  // ================= ORDERS =================
  createOrder(data: CreateOrderDto): Observable<ApiResponse<OrderResultDto>> {
    return this.http.post<ApiResponse<OrderResultDto>>(`${this.baseUrl}/orders`, data, { headers: this.getAuthHeaders() });
  }

  createInStoreOrder(data: CreateInStoreOrderDto): Observable<ApiResponse<OrderResultDto>> {
    return this.http.post<ApiResponse<OrderResultDto>>(`${this.baseUrl}/orders/in-store`, data, { headers: this.getAuthHeaders() });
  }

  getOrders(paging?: PagedRequest): Observable<ApiResponse<OrderDto[]>> {
    let params = new HttpParams();
    if (paging?.pageNumber) params = params.set('pageNumber', paging.pageNumber);
    if (paging?.pageSize) params = params.set('pageSize', paging.pageSize);
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.baseUrl}/orders`, { params, headers: this.getAuthHeaders() });
  }

  getMyOrders(): Observable<ApiResponse<OrderDto[]>> {
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.baseUrl}/orders/my`, { headers: this.getAuthHeaders() });
  }

  getOrderById(id: string): Observable<ApiResponse<OrderDto>> {
    return this.http.get<ApiResponse<OrderDto>>(`${this.baseUrl}/orders/${id}`, { headers: this.getAuthHeaders() });
  }

  updateOrderStatus(id: string, data: UpdateOrderStatusDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/orders/${id}/status`, data, { headers: this.getAuthHeaders() });
  }

  cancelOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/orders/${id}/cancel`, {}, { headers: this.getAuthHeaders() });
  }

  deleteOrder(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/orders/${id}`, { headers: this.getAuthHeaders() });
  }

  // ================= PAYMENTS =================
  initiatePayment(data: PaymobInitiatePaymentDto): Observable<ApiResponse<PaymobInitiatePaymentResponseDto>> {
    return this.http.post<ApiResponse<PaymobInitiatePaymentResponseDto>>(`${this.baseUrl}/payments/initiate`, data, { headers: this.getAuthHeaders() });
  }

  // ================= RETURNS =================
  createReturn(data: CreateReturnRequestDto): Observable<ApiResponse<ReturnRequestDto>> {
    return this.http.post<ApiResponse<ReturnRequestDto>>(`${this.baseUrl}/returns`, data, { headers: this.getAuthHeaders() });
  }

  getMyReturns(): Observable<ApiResponse<ReturnRequestDto[]>> {
    return this.http.get<ApiResponse<ReturnRequestDto[]>>(`${this.baseUrl}/returns/my`, { headers: this.getAuthHeaders() });
  }

  getAllReturns(): Observable<ApiResponse<ReturnRequestDto[]>> {
    return this.http.get<ApiResponse<ReturnRequestDto[]>>(`${this.baseUrl}/returns`, { headers: this.getAuthHeaders() });
  }

  getReturnById(id: string): Observable<ApiResponse<ReturnRequestDto>> {
    return this.http.get<ApiResponse<ReturnRequestDto>>(`${this.baseUrl}/returns/${id}`, { headers: this.getAuthHeaders() });
  }

  processReturn(id: string, data: ProcessReturnDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/returns/${id}/process`, data, { headers: this.getAuthHeaders() });
  }

  // ================= DEALS =================
  getDeals(): Observable<ApiResponse<DealDto[]>> {
    return this.http.get<ApiResponse<DealDto[]>>(`${this.baseUrl}/deals`);
  }

  getActiveDeals(): Observable<ApiResponse<DealDto[]>> {
    return this.http.get<ApiResponse<DealDto[]>>(`${this.baseUrl}/deals/active`);
  }

  getDealById(id: string): Observable<ApiResponse<DealDto>> {
    return this.http.get<ApiResponse<DealDto>>(`${this.baseUrl}/deals/${id}`);
  }

  createDeal(data: CreateDealDto): Observable<ApiResponse<DealDto>> {
    return this.http.post<ApiResponse<DealDto>>(`${this.baseUrl}/deals`, data, { headers: this.getAuthHeaders() });
  }

  updateDeal(id: string, data: UpdateDealDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/deals/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteDeal(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/deals/${id}`, { headers: this.getAuthHeaders() });
  }

  toggleDealActive(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/deals/${id}/toggle-active`, {}, { headers: this.getAuthHeaders() });
  }

  // ================= STOCK MOVEMENTS =================
  getStockMovements(): Observable<ApiResponse<StockMovementDto[]>> {
    return this.http.get<ApiResponse<StockMovementDto[]>>(`${this.baseUrl}/stock-movements`, { headers: this.getAuthHeaders() });
  }

  getStockMovementsByProduct(productId: string): Observable<ApiResponse<StockMovementDto[]>> {
    return this.http.get<ApiResponse<StockMovementDto[]>>(`${this.baseUrl}/stock-movements/product/${productId}`, { headers: this.getAuthHeaders() });
  }

  addStockMovement(data: CreateStockMovementDto): Observable<ApiResponse<StockMovementDto>> {
    return this.http.post<ApiResponse<StockMovementDto>>(`${this.baseUrl}/stock-movements`, data, { headers: this.getAuthHeaders() });
  }

  addStockMovementWithNewProduct(data: CreateStockMovementWithNewProductDto): Observable<ApiResponse<StockMovementDto>> {
    return this.http.post<ApiResponse<StockMovementDto>>(`${this.baseUrl}/stock-movements/with-new-product`, data, { headers: this.getAuthHeaders() });
  }

  // ================= HOME PAGE =================
  getHomePageConfig(): Observable<ApiResponse<HomePageConfigDto>> {
    return this.http.get<ApiResponse<HomePageConfigDto>>(`${this.baseUrl}/home-page/config`);
  }

  updateCategoryOrder(data: UpdateCategoryOrderDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/home-page/category-order`, data, { headers: this.getAuthHeaders() });
  }

  updateFeaturedProductsOrder(data: any): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/home-page/featured-products/order`, data, { headers: this.getAuthHeaders() });
  }

  updateFeaturedProduct(data: UpdateFeaturedProductDto): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/home-page/featured-product`, data, { headers: this.getAuthHeaders() });
  }

  // ================= DASHBOARD =================
  getDashboardStats(): Observable<ApiResponse<DashboardStatsDto>> {
    return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.baseUrl}/dashboard/stats`, { headers: this.getAuthHeaders() });
  }

  getDashboardBestSelling(): Observable<ApiResponse<BestSellingProductDto[]>> {
    return this.http.get<ApiResponse<BestSellingProductDto[]>>(`${this.baseUrl}/dashboard/best-selling`, { headers: this.getAuthHeaders() });
  }

  getDashboardMostProfitable(): Observable<ApiResponse<MostProfitableProductDto[]>> {
    return this.http.get<ApiResponse<MostProfitableProductDto[]>>(`${this.baseUrl}/dashboard/most-profitable`, { headers: this.getAuthHeaders() });
  }

  getDashboardRecentOrders(): Observable<ApiResponse<RecentOrderDto[]>> {
    return this.http.get<ApiResponse<RecentOrderDto[]>>(`${this.baseUrl}/dashboard/recent-orders`, { headers: this.getAuthHeaders() });
  }

  getDashboardSalesChart(days = 30): Observable<ApiResponse<SalesChartDataDto[]>> {
    return this.http.get<ApiResponse<SalesChartDataDto[]>>(`${this.baseUrl}/dashboard/sales-chart`, {
      params: new HttpParams().set('days', days),
      headers: this.getAuthHeaders()
    });
  }

  // ================= ADMIN =================
  getAllUsers(): Observable<ApiResponse<UserDto[]>> {
    return this.http.get<ApiResponse<UserDto[]>>(`${this.baseUrl}/admin/users`, { headers: this.getAuthHeaders() });
  }

  getUserById(id: string): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/admin/users/${id}`, { headers: this.getAuthHeaders() });
  }

  toggleUserBlock(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/admin/users/${id}/block`, {}, { headers: this.getAuthHeaders() });
  }

  toggleUserFlag(id: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/admin/users/${id}/flag`, {}, { headers: this.getAuthHeaders() });
  }

  getUserOrders(id: string): Observable<ApiResponse<OrderDto[]>> {
    return this.http.get<ApiResponse<OrderDto[]>>(`${this.baseUrl}/admin/users/${id}/orders`, { headers: this.getAuthHeaders() });
  }
}
