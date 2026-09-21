import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './features/home/home.component';
import { ProductsComponent } from './features/products/products.component';
import { SearchResultsComponent } from './features/search-results/search-results.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { PaymentComponent } from './features/payment/payment.component';
import { UserOrdersComponent } from './features/orders/user-orders.component';
import { AdminShellComponent } from './features/admin/admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './features/admin/products/admin-products.component';
import { AdminCategoriesComponent } from './features/admin/categories/admin-categories.component';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders.component';
import { AdminOrderCreateComponent } from './features/admin/orders/admin-order-create.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminReturnsComponent } from './features/admin/returns/admin-returns.component';
import { AdminDealsComponent } from './features/admin/deals/admin-deals.component';
import { AdminStockComponent } from './features/admin/stock/admin-stock.component';
import { AdminHomePageComponent } from './features/admin/home-page/admin-home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products/category/:id', component: ProductsComponent },
      { path: 'products/search', component: SearchResultsComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
      { path: 'orders', component: UserOrdersComponent, canActivate: [authGuard] },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/create', component: AdminOrderCreateComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'returns', component: AdminReturnsComponent },
      { path: 'deals', component: AdminDealsComponent },
      { path: 'stock', component: AdminStockComponent },
      { path: 'home-page', component: AdminHomePageComponent },
    ]
  }
];
