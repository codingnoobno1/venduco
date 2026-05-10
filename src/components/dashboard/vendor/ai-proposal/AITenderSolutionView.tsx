"use client"

import React from 'react'
import { CheckCircle2, ArrowRight, Sparkles, Building2, Truck, ShieldCheck } from 'lucide-react'

interface AITenderSolutionViewProps {
    vendorData: any
}

export function AITenderSolutionView({ vendorData }: AITenderSolutionViewProps) {
    const companyName = vendorData?.companyIdentity?.companyName || "Vendor"
    const location = vendorData?.companyIdentity?.registeredLocation?.city || "Local Area"
    const equipment = vendorData?.equipmentDeployment || []
    const safety = vendorData?.executionCapacity?.find((c: any) => c.qualityReadiness?.safetyTraining)

    const comparisons = [
        {
            icon: Building2,
            requirement: "Technical: Mobilization within 10 days of order.",
            solution: `Mobilization within 72 hours using ${companyName}'s local fleet in ${location}.`,
            match: 100,
            color: "text-blue-500"
        },
        {
            icon: Truck,
            requirement: "Equipment: Minimum 5 excavators (Euro VI).",
            solution: equipment.length > 0
                ? `${equipment[0].machines[0].deployableRange} ${equipment[0].machines[0].machineType} available in active fleet.`
                : "8 excavators (Euro VI) available in Tier 1 fleet inventory.",
            match: 100,
            color: "text-indigo-500"
        },
        {
            icon: ShieldCheck,
            requirement: "Safety: ISO 45001 certified site management.",
            solution: safety
                ? "100% OSH/Safety team readiness with active QA/QC frameworks."
                : "Proposed implementation of proprietary safety framework and 0-LTI monitoring.",
            match: safety ? 100 : 92,
            color: "text-purple-500"
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Requirement-Solution Mapping</h4>
            </div>

            <div className="space-y-4">
                {comparisons.map((item, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center group">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-900">
                            <div className="flex items-center gap-2 mb-2">
                                <item.icon className="w-4 h-4 text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tender Requirement</p>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.requirement}</p>
                        </div>
                        <div className="relative p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all">
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden md:block group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex justify-between items-start mb-1">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>Proposed Solution</p>
                                <span className="text-[10px] font-bold text-green-600">MATCH {item.match}%</span>
                            </div>
                            <p className="text-xs text-slate-900 dark:text-white font-bold">{item.solution}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
