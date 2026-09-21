export interface PaymobInitiatePaymentDto {
  orderId: string;
  currency: string;
  /** "card" | "wallet" — the backend decides which integration ID to use */
  paymentMethod?: string;
  /** Customer wallet number, required when paymentMethod = "wallet" */
  walletPhone?: string;
}

export interface PaymobOrderItemDto {
  name: string;
  amountCents: number;
  description: string;
  quantity: number;
}

export interface PaymobInitiatePaymentResponseDto {
  paymentToken: string;
  orderId: number;
  iframeUrl: string;
  /** Wallet provider redirect URL (wallet payments) */
  redirectUrl?: string;
}

export interface PaymobCallbackDto {
  type?: string;
  obj?: any;
  order: number;
  success: boolean;
  amountCents: number;
}
