// Loading Skeleton Component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "circle" | "rect"
}

export function Skeleton({
    variant = "rect",
    className,
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse bg-slate-200",
                variant === "text" && "h-4 w-full rounded",
                variant === "circle" && "rounded-full",
                variant === "rect" && "rounded-lg",
                className
            )}
            {...props}
        />
    )
}
