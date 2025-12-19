// Text Highlight Component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "blue" | "green" | "yellow"
}

export function Highlight({
    variant = "blue",
    className,
    ...props
}: HighlightProps) {
    return (
        <span
            className={cn(
                "font-semibold",
                variant === "default" && "text-slate-900",
                variant === "blue" && "text-blue-600",
                variant === "green" && "text-green-600",
                variant === "yellow" && "text-yellow-600",
                className
            )}
            {...props}
        />
    )
}
