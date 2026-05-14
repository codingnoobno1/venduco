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

export class CashfreeGateway implements PaymentGateway {
  readonly name = 'CASHFREE' as const;

  async createOrder(_params: CreateOrderParams): Promise<CreateOrderResult> {
    throw new Error('CashfreeGateway not yet implemented');
  }

  async verifyPayment(_params: VerifyPaymentParams): Promise<boolean> {
    throw new Error('CashfreeGateway not yet implemented');
  }

  async initiatePayout(_params: PayoutParams): Promise<PayoutResult> {
    throw new Error('CashfreeGateway not yet implemented');
  }

  async initiateRefund(_params: RefundParams): Promise<RefundResult> {
    throw new Error('CashfreeGateway not yet implemented');
  }
}
