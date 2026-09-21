export interface ProductDto {
  id: string;
  nameAr: string;
  nameEn: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  categoryId?: string;
  categoryName?: string;
  isFeatured: boolean;
  discountPercentage?: number;
  finalPrice?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Note: Backend Create/Update use [FromBody] JSON — image is uploaded separately
export interface CreateProductDto {
  nameAr: string;
  nameEn?: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  categoryName?: string;
}

export interface UpdateProductDto {
  id: string;
  nameAr: string;
  nameEn?: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  categoryName?: string;
  isActive: boolean;
}
