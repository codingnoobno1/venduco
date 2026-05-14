'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToggleLeft, ToggleRight, Plus } from 'lucide-react';

const STRATEGIES = ['ALL', 'PERCENTAGE', 'WHITELIST', 'NEW_USERS_ONLY', 'CITY', 'TIER'];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key: '', description: '', rolloutStrategy: 'ALL', rolloutPercentage: 100 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/revenue/flags');
    const data = await res.json();
    setFlags(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(flag: any) {
    await fetch(`/api/admin/revenue/flags/${flag.key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: !flag.isEnabled }),
    });
    await load();
  }

  async function create() {
    setSaving(true);
    await fetch('/api/admin/revenue/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isEnabled: false }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ key: '', description: '', rolloutStrategy: 'ALL', rolloutPercentage: 100 });
    await load();
  }

  const enabled = flags.filter(f => f.isEnabled);
  const disabled = flags.filter(f => !f.isEnabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-500 text-sm mt-1">{enabled.length} enabled / {disabled.length} disabled</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> New Flag
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Create Feature Flag</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Flag Key *</label>
              <input
                type="text"
                value={form.key}
                onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="e.g. escrow_enabled"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Rollout Strategy</label>
              <select
                value={form.rolloutStrategy}
                onChange={e => setForm(f => ({ ...f, rolloutStrategy: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {STRATEGIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {form.rolloutStrategy === 'PERCENTAGE' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Rollout % (1-100)</label>
                <input
                  type="number"
                  value={form.rolloutPercentage}
                  onChange={e => setForm(f => ({ ...f, rolloutPercentage: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="1" max="100"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={create} disabled={!form.key || saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {saving ? 'Creating…' : 'Create (starts disabled)'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-600 px-4 py-2 text-sm hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : flags.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No flags yet. Create one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Key</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Strategy</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flags.map((f: any) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs text-gray-900">{f.key}</td>
                  <td className="px-6 py-4 text-gray-600">{f.description || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{f.rolloutStrategy}</span>
                    {f.rolloutStrategy === 'PERCENTAGE' && (
                      <span className="ml-1 text-xs text-gray-500">{f.rolloutPercentage}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggle(f)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      {f.isEnabled
                        ? <ToggleRight size={24} className="text-indigo-600" />
                        : <ToggleLeft size={24} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
