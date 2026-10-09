// Tender statistics graph component
"use client"

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const tenderData = [
    { month: 'Jan', tenders: 45, value: 850 },
    { month: 'Feb', tenders: 52, value: 920 },
    { month: 'Mar', tenders: 61, value: 1100 },
    { month: 'Apr', tenders: 75, value: 1350 },
    { month: 'May', tenders: 89, value: 1580 },
    { month: 'Jun', tenders: 104, value: 1820 },
]

export function TenderGraph() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                📈 Tender Growth Trend
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={tenderData}>
                    <defs>
                        <linearGradient id="colorTenders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="tenders"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorTenders)"
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-green-600">↑ 131%</span> growth in last 6 months
            </div>
        </div>
    )
}
