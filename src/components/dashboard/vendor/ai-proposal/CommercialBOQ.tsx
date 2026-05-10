"use client"

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, TrendingUp, Calculator } from 'lucide-react'

export function CommercialBOQ() {
    const schedules = [
        { dia: "1 inch", length: "4000 mm", qty: 10, rate: 13500, amount: 135000 },
        { dia: "1½ inch", length: "4000 mm", qty: 10, rate: 18100, amount: 181000 },
        { dia: "1½ inch", length: "2800 mm", qty: 4, rate: 15800, amount: 63200 },
        { dia: "1½ inch", length: "2400 mm", qty: 22, rate: 15400, amount: 338800 },
    ]

    const earlierItems = [
        { desc: "¾ inch – 5000 mm", amount: 36200 },
        { desc: "¾ inch – 1600 mm", amount: 17800 },
    ]

    const materialSubtotal = 772000
    const installation = 152100
    const transport = 5070
    const gstAmount = 865539 // As per Schedule 14 provided by user
    const total = materialSubtotal + installation + transport + gstAmount

    return (
        <div className="space-y-4">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-800 overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-4">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-blue-400" />
                        <CardTitle className="text-sm font-black uppercase tracking-tight">Commercial BOQ</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/30">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md space-y-3">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <Calculator className="w-3 h-3 text-blue-500" />
                                Financial Summary
                            </h4>
                            <div className="space-y-2 text-[11px]">
                                <div className="flex justify-between text-slate-500">
                                    <span>Material</span>
                                    <span className="font-mono">₹{materialSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Installation</span>
                                    <span className="font-mono">₹{installation.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>GST @ 18%</span>
                                    <span className="font-mono">₹{Math.round(gstAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>TOTAL</span>
                                    <span className="font-mono">₹{Math.round(total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
