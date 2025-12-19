// Feature card component (mobile-first)
"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    benefits?: string[]
    iconColor?: string
    className?: string
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    benefits,
    iconColor = "text-blue-600",
    className
}: FeatureCardProps) {
    return (
        <Card className={cn("h-full hover:shadow-lg transition-shadow", className)}>
            <CardHeader>
                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3 sm:mb-4", iconColor)}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-slate-600">{description}</p>
                {benefits && benefits.length > 0 && (
                    <ul className="space-y-2">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start text-xs sm:text-sm text-slate-700">
                                <span className={cn("mr-2 flex-shrink-0", iconColor)}>✓</span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
