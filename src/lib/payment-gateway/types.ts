export interface CreateOrderParams {
  amount: number;
  currency: string;
  receiptId: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  gatewayOrderId: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface PayoutParams {
  payoutId: string;
  upiId: string;
  amount: number;
  purpose: string;
  referenceId: string;
}

export interface PayoutResult {
  payoutId: string;
  status: 'INITIATED' | 'PAID' | 'FAILED';
  gatewayPayoutId: string;
}

export interface RefundParams {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundResult {
  refundId: string;
  status: 'PENDING' | 'PROCESSED';
}

export interface PaymentGateway {
  readonly name: 'DUMMY' | 'RAZORPAY' | 'CASHFREE';

  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
  initiatePayout(params: PayoutParams): Promise<PayoutResult>;
  initiateRefund(params: RefundParams): Promise<RefundResult>;
}
