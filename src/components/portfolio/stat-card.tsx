// Stat/Metric Card Component
"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
    icon: LucideIcon
    value: string
    label: string
    trend?: string
    iconColor?: string
}

export function StatCard({ icon: Icon, value, label, trend, iconColor = "text-blue-600" }: StatCardProps) {
    return (
        <Card className="text-center">
            <CardContent className="pt-4 sm:pt-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-3 ${iconColor}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{value}</div>
                <div className="text-sm text-slate-600">{label}</div>
                {trend && (
                    <div className="text-xs text-green-600 mt-2">{trend}</div>
                )}
            </CardContent>
        </Card>
    )
}
