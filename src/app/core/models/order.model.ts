export enum OrderStatus {
  PendingPayment = 0,
  Paid = 1,
  Failed = 2,
  Processing = 3,
  Delivered = 4,
  Returned = 5,
  Cancelled = 6
}

export enum OrderType {
  Retail = 0,
  Wholesale = 1
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  type: OrderType;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  deliveryFee: number;
  isPaid: boolean;
  isInStore: boolean;
  items: OrderItemDto[];
}

export interface OrderResultDto {
  orderId: string;
  total: number;
  status: number;
  type: OrderType;
  deliveryFee: number;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: CreateOrderItemDto[];
  isInStore: boolean;
}

export interface CreateInStoreOrderDto {
  items: CreateOrderItemDto[];
  notes?: string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: OrderStatus;
  isPaid: boolean;
}
