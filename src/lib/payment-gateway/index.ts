import { getActiveConfig } from '../pricing';
import { DummyGateway } from './dummy';
import type { PaymentGateway } from './types';

export type { PaymentGateway, CreateOrderParams, CreateOrderResult, PayoutParams, PayoutResult, RefundParams, RefundResult, VerifyPaymentParams } from './types';

let _cachedGateway: PaymentGateway | null = null;
let _cachedGatewayName: string | null = null;

export async function getGateway(): Promise<PaymentGateway> {
  const config = await getActiveConfig();

  if (_cachedGateway && _cachedGatewayName === config.paymentGateway) {
    return _cachedGateway;
  }

  let gateway: PaymentGateway;

  switch (config.paymentGateway) {
    case 'RAZORPAY':
      // Lazily imported so the dependency is optional until Razorpay is wired up
      const { RazorpayGateway } = await import('./razorpay');
      gateway = new RazorpayGateway();
      break;

    case 'CASHFREE':
      const { CashfreeGateway } = await import('./cashfree');
      gateway = new CashfreeGateway();
      break;

    case 'DUMMY':
    default:
      gateway = new DummyGateway();
      break;
  }

  _cachedGateway = gateway;
  _cachedGatewayName = config.paymentGateway;
  return gateway;
}

// Call this after admin changes paymentGateway in PlatformConfig
export function invalidateGatewayCache() {
  _cachedGateway = null;
  _cachedGatewayName = null;
}
