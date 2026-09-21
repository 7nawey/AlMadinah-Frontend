export interface ReturnRequestDto {
  id: string;
  orderId: string;
  userId: string;
  createdAt: string;
  status: string;
  adminNotes?: string;
  processedAt?: string;
  items: ReturnItemDto[];
}

export interface ReturnItemDto {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: string;
}

export interface CreateReturnRequestDto {
  orderId: string;
  items: CreateReturnItemDto[];
}

export interface CreateReturnItemDto {
  orderItemId: string;
  quantity: number;
}

export interface ProcessReturnDto {
  returnRequestId: string;
  status: string;
  adminNotes?: string;
  itemDecisions?: ProcessReturnItemDto[];
}

export interface ProcessReturnItemDto {
  returnItemId: string;
  status: string;
}
