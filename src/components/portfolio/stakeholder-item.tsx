// Stakeholder card component
"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface StakeholderItemProps {
    name: string
    fullName: string
}

export function StakeholderItem({ name, fullName }: StakeholderItemProps) {
    return (
        <li className="flex items-start space-x-2 sm:space-x-3">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 sm:mt-1 flex-shrink-0" />
            <span className="text-sm sm:text-base text-slate-700">
                <strong className="text-slate-900">{name}</strong> - {fullName}
            </span>
        </li>
    )
}
