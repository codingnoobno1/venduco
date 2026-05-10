"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, TrendingUp, BarChart3 } from 'lucide-react'

export function EligibilityScoring() {
    const technical = {
        status: 'ELIGIBLE',
        score: 95,
        points: [
            { label: "Manufacturing & Supply of Hoses (>= 70 bar)", value: "CONFIRMED", met: true },
            { label: "Railways/PSU Experience", value: "12 YRS", met: true },
            { label: "3 Works @ >= 30% Value", value: "VERIFIED", met: true }
        ]
    }

    const financial = {
        status: 'ELIGIBLE',
        score: 88,
        points: [
            { label: "Avg Annual Turnover (Min V/N)", value: "₹4.8 Cr (Req: ₹1.2 Cr)", met: true },
            { label: "Audited Balance Sheets (3 YRS)", value: "ATTACHED", met: true },
            { label: "Bank Solvency / Liquidity Proof", value: "VERIFIED", met: true }
        ]
    }

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-md bg-green-50/30 dark:bg-green-950/20 border-l-4 border-green-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck className="w-24 h-24" />
                </div>
                <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Technical Filter</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">TECHNICAL ELIGIBLE</h4>
                        </div>
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black">
                            SCORE: {technical.score}%
                        </div>
                    </div>
                    <div className="space-y-3">
                        {technical.points.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">{p.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
                                    {p.met ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-blue-50/30 dark:bg-blue-950/20 border-l-4 border-blue-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <BarChart3 className="w-24 h-24" />
                </div>
                <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Financial Integrity</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">FINANCIAL SCORE</h4>
                        </div>
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">
                            PASS
                        </div>
                    </div>
                    <div className="space-y-3">
                        {financial.points.map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">{p.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">{p.value}</span>
                                    {p.met ? <CheckCircle2 className="w-4 h-4 text-blue-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
