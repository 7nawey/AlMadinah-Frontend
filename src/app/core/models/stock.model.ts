export interface StockMovementDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  type: string;
  notes?: string;
  date: string;
}

export interface CreateStockMovementDto {
  productId: string;
  quantity: number;
  unitCost?: number;
  supplier?: string;
  notes?: string;
}

export interface CreateStockMovementWithNewProductDto {
  nameAr: string;
  nameEn: string;
  description?: string;
  barcode?: string;
  price: number;
  costPrice: number;
  initialStock: number;
  categoryId?: string;
  unitCost?: number;
  supplier?: string;
  notes?: string;
}
