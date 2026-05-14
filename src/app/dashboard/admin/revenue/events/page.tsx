'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Filter } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  COMMISSION_CHARGED: 'bg-green-100 text-green-700',
  SUBSCRIPTION_PAID: 'bg-blue-100 text-blue-700',
  BOOST_PURCHASED: 'bg-purple-100 text-purple-700',
  WAIVED: 'bg-gray-100 text-gray-600',
};

export default function RevenueEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [excludeDummy, setExcludeDummy] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const load = useCallback(async (cursor?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (excludeDummy) params.set('excludeDummy', 'true');
    if (typeFilter) params.set('type', typeFilter);
    if (cursor) params.set('cursor', cursor);

    const res = await fetch(`/api/admin/revenue/events?${params}`);
    const data = await res.json();

    if (cursor) {
      setEvents(prev => [...prev, ...(data.data ?? [])]);
    } else {
      setEvents(data.data ?? []);
    }
    setNextCursor(data.nextCursor);
    setLoading(false);
  }, [excludeDummy, typeFilter]);

  useEffect(() => { load(); }, [load]);

  function fmt(n: number) {
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={24} className="text-green-600" /> Revenue Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">Full audit log of every charge, waiver, and subscription payment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4">
        <Filter size={16} className="text-gray-400" />
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeDummy}
            onChange={e => setExcludeDummy(e.target.checked)}
            className="rounded"
          />
          Exclude dummy transactions
        </label>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All types</option>
          <option value="COMMISSION_CHARGED">Commission Charged</option>
          <option value="SUBSCRIPTION_PAID">Subscription Paid</option>
          <option value="BOOST_PURCHASED">Boost Purchased</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading && events.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No revenue events yet</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Vendor</th>
                  <th className="px-6 py-3 text-right">Base</th>
                  <th className="px-6 py-3 text-right">Fee</th>
                  <th className="px-6 py-3 text-left">Mode</th>
                  <th className="px-6 py-3 text-left">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((e: any) => (
                  <tr key={e._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[e.type] ?? 'bg-gray-100'}`}>
                        {e.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{String(e.vendorId).slice(-8)}</td>
                    <td className="px-6 py-3 text-right text-gray-900">{fmt(e.baseAmount)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-green-700">{fmt(e.feeAmount)}</td>
                    <td className="px-6 py-3 text-xs text-gray-500">{e.feeMode}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        {e.capApplied && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">CAP</span>}
                        {e.overrideApplied && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">OVR</span>}
                        {e.isDummyTransaction && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">TEST</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {nextCursor && (
              <div className="px-6 py-4 border-t border-gray-100 text-center">
                <button
                  onClick={() => load(nextCursor)}
                  disabled={loading}
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-700 disabled:opacity-60"
                >
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
