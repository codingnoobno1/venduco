'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function DummyPaymentPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get('amount') ?? '0';
  const escrowId = searchParams.get('escrowId') ?? '';
  const returnUrl = searchParams.get('returnUrl') ?? '/dashboard';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [error, setError] = useState('');

  async function handlePay() {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                order_id: params.orderId,
                id: `dummy_pay_${Date.now()}`,
              },
            },
          },
        }),
      });

      if (!res.ok) throw new Error('Payment confirmation failed');

      setStatus('success');
      setTimeout(() => router.push(returnUrl), 1500);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setStatus('failed');
    }
  }

  function handleCancel() {
    router.push(returnUrl);
  }

  const rupees = (parseFloat(amount) / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          DUMMY PAYMENT — TEST MODE
        </div>

        <div>
          <p className="text-gray-500 text-sm">Amount to pay</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{rupees}</p>
          <p className="text-xs text-gray-400 mt-1">Order: {params.orderId}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 text-left space-y-1">
          <p className="font-semibold">This is a simulated checkout</p>
          <p>No real money will be charged. Razorpay integration coming soon.</p>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium">
            Payment successful! Redirecting…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {status !== 'success' && (
          <div className="space-y-3">
            <button
              onClick={handlePay}
              disabled={status === 'loading'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {status === 'loading' ? 'Processing…' : 'Pay Now (Dummy)'}
            </button>
            <button
              onClick={handleCancel}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
