'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Zap, ToggleLeft, ToggleRight, AlertTriangle,
  TrendingUp, Shield, Users, ChevronRight, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const STAGE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  STAGE_0_PREMARKET: { label: 'Stage 0 — Pre-Market', color: 'bg-slate-100 text-slate-700', desc: 'Everything free. Building user base.' },
  STAGE_1_EARLY_GROWTH: { label: 'Stage 1 — Early Growth', color: 'bg-blue-100 text-blue-700', desc: 'Subscriptions live, no commission yet.' },
  STAGE_2_PMF: { label: 'Stage 2 — PMF', color: 'bg-amber-100 text-amber-700', desc: '2% commission + subscriptions.' },
  STAGE_3_SCALE: { label: 'Stage 3 — Scale', color: 'bg-green-100 text-green-700', desc: '5% commission + full tier pricing.' },
};

const STAGE_NUMS: Record<string, number> = {
  STAGE_0_PREMARKET: 0, STAGE_1_EARLY_GROWTH: 1, STAGE_2_PMF: 2, STAGE_3_SCALE: 3,
};

export default function AdminRevenuePage() {
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [cfgRes, statsRes] = await Promise.all([
      fetch('/api/admin/revenue/config'),
      fetch('/api/admin/revenue/stats?excludeDummy=true'),
    ]);
    setConfig((await cfgRes.json()).data);
    setStats((await statsRes.json()).data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function transitionStage(target: number) {
    if (!confirm(`Transition to Stage ${target}? This affects all vendors immediately.`)) return;
    setTransitioning(true);
    const res = await fetch('/api/admin/revenue/stage-transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStage: target }),
    });
    const data = await res.json();
    setMessage(data.success ? `Moved to Stage ${target}` : data.error);
    await load();
    setTransitioning(false);
  }

  async function emergencyOff() {
    if (!confirm('EMERGENCY OFF: Disable all revenue collection immediately?')) return;
    setEmergencyLoading(true);
    await fetch('/api/admin/revenue/emergency-off', { method: 'POST' });
    setMessage('Emergency off triggered — all revenue collection disabled');
    await load();
    setEmergencyLoading(false);
  }

  const currentStageInfo = config ? STAGE_LABELS[config.stage] : null;
  const currentStageNum = config ? (STAGE_NUMS[config.stage] ?? 0) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Control Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage pricing stages, overrides, and feature flags</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* Current Stage Banner */}
      {currentStageInfo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-6 py-4 flex items-center justify-between ${currentStageInfo.color}`}
        >
          <div>
            <div className="font-semibold text-lg">{currentStageInfo.label}</div>
            <div className="text-sm mt-0.5 opacity-80">{currentStageInfo.desc}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${config?.commissionEnabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
              Commission {config?.commissionEnabled ? `ON (${config.commissionRate}%)` : 'OFF'}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${config?.subscriptionEnabled ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
              Subscriptions {config?.subscriptionEnabled ? 'ON' : 'OFF'}
            </span>
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/60">
              {config?.paymentGateway}
            </span>
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp size={20} className="text-green-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{stats ? stats.totalRevenue.toLocaleString('en-IN') : '—'}
              </div>
              <div className="text-xs text-gray-500">Live Revenue (excl. dummy)</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><DollarSign size={20} className="text-blue-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{stats ? stats.totalVolume.toLocaleString('en-IN') : '—'}
              </div>
              <div className="text-xs text-gray-500">Total Transaction Volume</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Users size={20} className="text-purple-600" /></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats?.byType?.reduce((a: number, t: any) => a + t.count, 0) ?? '—'}
              </div>
              <div className="text-xs text-gray-500">Total Revenue Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Transition */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" /> Stage Transition
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(n => {
            const key = Object.entries(STAGE_NUMS).find(([, v]) => v === n)?.[0] ?? '';
            const info = STAGE_LABELS[key];
            const isCurrent = n === currentStageNum;
            return (
              <button
                key={n}
                onClick={() => transitionStage(n)}
                disabled={isCurrent || transitioning}
                className={`rounded-xl p-4 text-left border-2 transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50 cursor-default'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                } disabled:opacity-60`}
              >
                <div className="text-xs font-bold text-gray-500 mb-1">STAGE {n}</div>
                <div className="text-sm font-semibold text-gray-900">{info?.label.split('—')[1]?.trim()}</div>
                <div className="text-xs text-gray-500 mt-1">{info?.desc}</div>
                {isCurrent && <div className="text-xs text-indigo-600 font-semibold mt-2">Current</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/dashboard/admin/revenue/overrides', icon: Shield, label: 'Vendor Overrides', desc: 'Founding partners & enterprise deals' },
          { href: '/dashboard/admin/revenue/flags', icon: ToggleRight, label: 'Feature Flags', desc: 'Gradual rollouts & A/B tests' },
          { href: '/dashboard/admin/revenue/events', icon: DollarSign, label: 'Revenue Events', desc: 'Full audit log of charges' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-50 rounded-lg"><Icon size={18} className="text-indigo-600" /></div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <div className="font-semibold text-gray-900">{label}</div>
            <div className="text-xs text-gray-500 mt-1">{desc}</div>
          </Link>
        ))}
      </div>

      {/* Emergency Off */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-600" />
            <div>
              <div className="font-semibold text-red-900">Emergency Kill Switch</div>
              <div className="text-sm text-red-700">Instantly disables all revenue collection. Use only in a billing emergency.</div>
            </div>
          </div>
          <button
            onClick={emergencyOff}
            disabled={emergencyLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {emergencyLoading ? 'Disabling…' : 'Emergency OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
