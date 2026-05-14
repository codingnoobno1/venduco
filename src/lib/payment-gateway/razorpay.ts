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

export class RazorpayGateway implements PaymentGateway {
  readonly name = 'RAZORPAY' as const;

  private get keyId() {
    return process.env.RAZORPAY_KEY_ID ?? '';
  }
  private get keySecret() {
    return process.env.RAZORPAY_KEY_SECRET ?? '';
  }

  async createOrder(_params: CreateOrderParams): Promise<CreateOrderResult> {
    throw new Error('RazorpayGateway.createOrder not yet implemented — add RAZORPAY_KEY_ID/SECRET to env');
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    throw new Error('RazorpayGateway.verifyPayment not yet implemented');
  }

  async initiatePayout(_params: PayoutParams): Promise<PayoutResult> {
    throw new Error('RazorpayGateway.initiatePayout not yet implemented');
  }

  async initiateRefund(_params: RefundParams): Promise<RefundResult> {
    throw new Error('RazorpayGateway.initiateRefund not yet implemented');
  }
}
