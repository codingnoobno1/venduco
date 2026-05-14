'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, X, Check } from 'lucide-react';

const REASONS = ['FOUNDING_PARTNER', 'ENTERPRISE_DEAL', 'PROMO', 'COMPENSATION', 'BETA_TESTER'];
const REASON_COLORS: Record<string, string> = {
  FOUNDING_PARTNER: 'bg-purple-100 text-purple-700',
  ENTERPRISE_DEAL: 'bg-blue-100 text-blue-700',
  PROMO: 'bg-amber-100 text-amber-700',
  COMPENSATION: 'bg-red-100 text-red-700',
  BETA_TESTER: 'bg-green-100 text-green-700',
};

export default function OverridesPage() {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendorId: '', reason: 'FOUNDING_PARTNER', commissionEnabledOverride: false,
    commissionRateOverride: '', maxJobsOverride: '', internalNote: '',
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/revenue/overrides');
    const data = await res.json();
    setOverrides(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deactivate(id: string) {
    await fetch(`/api/admin/revenue/overrides/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    });
    await load();
  }

  async function save() {
    setSaving(true);
    const payload: Record<string, any> = {
      vendorId: form.vendorId,
      reason: form.reason,
      commissionEnabledOverride: form.commissionEnabledOverride,
      internalNote: form.internalNote,
      effectiveFrom: new Date().toISOString(),
      validUntil: null,
    };
    if (form.commissionRateOverride) payload.commissionRateOverride = parseFloat(form.commissionRateOverride);
    if (form.maxJobsOverride) payload.maxJobsOverride = parseInt(form.maxJobsOverride);

    await fetch('/api/admin/revenue/overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ vendorId: '', reason: 'FOUNDING_PARTNER', commissionEnabledOverride: false, commissionRateOverride: '', maxJobsOverride: '', internalNote: '' });
    await load();
  }

  const active = overrides.filter(o => o.isActive);
  const inactive = overrides.filter(o => !o.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-purple-600" /> Vendor Pricing Overrides
          </h1>
          <p className="text-gray-500 text-sm mt-1">Per-vendor pricing exceptions — founding partners, enterprise deals, promos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> New Override
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Create Override</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Vendor ID *</label>
              <input
                type="text"
                value={form.vendorId}
                onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="MongoDB ObjectId"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Reason *</label>
              <select
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Commission Rate Override (%)</label>
              <input
                type="number"
                value={form.commissionRateOverride}
                onChange={e => setForm(f => ({ ...f, commissionRateOverride: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. 0 for free"
                min="0" max="100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Max Jobs Override (-1 = unlimited)</label>
              <input
                type="number"
                value={form.maxJobsOverride}
                onChange={e => setForm(f => ({ ...f, maxJobsOverride: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Leave empty to inherit"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="commEnabled"
                checked={form.commissionEnabledOverride}
                onChange={e => setForm(f => ({ ...f, commissionEnabledOverride: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="commEnabled" className="text-sm text-gray-700">Commission enabled for this vendor</label>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Internal Note</label>
              <input
                type="text"
                value={form.internalNote}
                onChange={e => setForm(f => ({ ...f, internalNote: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Agreed on 2024-01-15 call"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={!form.vendorId || saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Override'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      {/* Active */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">
          Active Overrides ({active.length})
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : active.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">No active overrides</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Vendor ID</th>
                <th className="px-6 py-3 text-left">Reason</th>
                <th className="px-6 py-3 text-left">Commission</th>
                <th className="px-6 py-3 text-left">Max Jobs</th>
                <th className="px-6 py-3 text-left">Note</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {active.map((o: any) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-700">{String(o.vendorId).slice(-8)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${REASON_COLORS[o.reason] ?? 'bg-gray-100 text-gray-600'}`}>
                      {o.reason.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {o.commissionEnabledOverride === false
                      ? <span className="text-green-600 font-medium">FREE</span>
                      : o.commissionRateOverride != null
                      ? `${o.commissionRateOverride}%`
                      : <span className="text-gray-400">Inherited</span>}
                  </td>
                  <td className="px-6 py-4">
                    {o.maxJobsOverride != null ? (o.maxJobsOverride === -1 ? '∞' : o.maxJobsOverride) : <span className="text-gray-400">Inherited</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{o.internalNote || '—'}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deactivate(o._id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                      <X size={12} /> Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {inactive.length > 0 && (
        <div className="text-sm text-gray-500 text-center">{inactive.length} inactive override(s) not shown</div>
      )}
    </div>
  );
}
