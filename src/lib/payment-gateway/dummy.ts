import { randomUUID } from 'crypto';
import type {
  PaymentGateway,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
  PayoutParams,
  PayoutResult,
  RefundParams,
  RefundResult,
} from './types';

export class DummyGateway implements PaymentGateway {
  readonly name = 'DUMMY' as const;

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const gatewayOrderId = `dummy_order_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    return {
      orderId: params.receiptId,
      amount: params.amount,
      currency: params.currency,
      gatewayOrderId,
    };
  }

  // In dummy mode every payment is auto-verified — the dummy-payment UI page
  // calls this after the user clicks "Pay Now" on the simulated checkout screen.
  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    return true;
  }

  async initiatePayout(params: PayoutParams): Promise<PayoutResult> {
    return {
      payoutId: params.payoutId,
      status: 'PAID',
      gatewayPayoutId: `dummy_payout_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    };
  }

  async initiateRefund(params: RefundParams): Promise<RefundResult> {
    return {
      refundId: `dummy_refund_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      status: 'PROCESSED',
    };
  }
}
