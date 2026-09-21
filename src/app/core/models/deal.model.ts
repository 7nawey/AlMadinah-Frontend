export interface DealDto {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface CreateDealDto {
  productId: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateDealDto {
  id: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}
