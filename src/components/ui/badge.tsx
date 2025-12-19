// Badge component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "warning" | "error" | "info"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variant === "default" && "bg-slate-100 text-slate-800",
                variant === "success" && "bg-green-100 text-green-800",
                variant === "warning" && "bg-yellow-100 text-yellow-800",
                variant === "error" && "bg-red-100 text-red-800",
                variant === "info" && "bg-blue-100 text-blue-800",
                className
            )}
            {...props}
        />
    )
}
