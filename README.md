# Al-Madinah Al-Munawwarah — Frontend

<div dir="rtl">

واجهة المستخدم لمنصة **المدينة المنورة** للتجارة الإلكترونية — مبنية بـ **Angular 19** مع دعم كامل للغتين العربية والإنجليزية (RTL / LTR).

</div>

Customer-facing storefront + admin dashboard for the Al-Madinah e-commerce platform, built with **Angular 19** and **Bootstrap 5**, with bilingual (Arabic / English) support.

---

## ✨ Features

- 🏠 **Home Page** — featured products, deals & categories
- 🛍️ **Product Catalog** — browsing, filtering, product details & search
- 🔍 **Search** — live search results page
- 🛒 **Checkout** — full checkout flow integrated with Paymob payments
- 💳 **Payment** — card & mobile-wallet payment pages
- 📦 **Orders** — order history & tracking for customers
- 🔐 **Auth** — register / login with JWT handling
- 🛠️ **Admin Dashboard** — manage products, categories, orders, stock, returns, deals & users
- 🌐 **i18n** — Arabic / English localization with RTL support

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| Angular 19 (standalone components) | Framework |
| TypeScript 5.7 | Language |
| Bootstrap 5 + Angular CDK | UI & styling |
| RxJS | Reactive state & HTTP |
| Karma + Jasmine | Unit testing |

## 📁 Project Structure

```
src/app/
├── core/                  # Singleton services & app-wide logic
│   ├── i18n/              # Translation service (AR / EN)
│   └── services/          # API service (HTTP layer)
├── features/              # Feature modules (one folder per page/area)
│   ├── home/              # Landing page
│   ├── products/          # Product listing
│   ├── product-detail/    # Single product view
│   ├── search-results/    # Search page
│   ├── checkout/          # Checkout flow
│   ├── payment/           # Paymob payment pages
│   ├── orders/            # Customer orders
│   ├── auth/              # Login & registration
│   └── admin/             # Admin dashboard (layout, shell, management pages)
├── layout/                # Shared layout (header, footer, ...)
└── shared/                # Reusable components, pipes & helpers
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- Angular CLI: `npm install -g @angular/cli`
- The backend API running — see [7nawey/AlMadinah-Backend](https://github.com/7nawey/AlMadinah-Backend)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/7nawey/AlMadinah-Frontend.git
   cd AlMadinah-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure the API URL** — point the API service to your running backend (default: `https://localhost:<port>/api`).

4. **Start the dev server**

   ```bash
   ng serve
   ```

   Open `http://localhost:4200/` — the app reloads automatically on file changes.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `ng serve` / `npm start` | Dev server on `http://localhost:4200/` |
| `ng build` / `npm run build` | Production build → `dist/` |
| `ng test` / `npm test` | Run unit tests (Karma + Jasmine) |
| `ng generate component <name>` | Scaffold a new component |

## 🔗 Related Repositories

- **Backend (.NET 8 API):** [7nawey/AlMadinah-Backend](https://github.com/7nawey/AlMadinah-Backend)

## 👤 Author

**Mohamed Emad Elhnawey** — [GitHub @7nawey](https://github.com/7nawey)
