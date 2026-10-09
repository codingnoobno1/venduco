// Icon wrapper component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg"
    variant?: "default" | "blue" | "green" | "orange" | "purple" | "red"
}

export function IconWrapper({
    size = "md",
    variant = "blue",
    className,
    children,
    ...props
}: IconWrapperProps) {
    return (
        <div
            className={cn(
                "rounded-lg flex items-center justify-center flex-shrink-0",
                size === "sm" && "w-8 h-8",
                size === "md" && "w-10 h-10 sm:w-12 sm:h-12",
                size === "lg" && "w-12 h-12 sm:w-14 sm:h-14",
                variant === "default" && "bg-slate-100 text-slate-600",
                variant === "blue" && "bg-blue-100 text-blue-600",
                variant === "green" && "bg-green-100 text-green-600",
                variant === "orange" && "bg-orange-100 text-orange-600",
                variant === "purple" && "bg-purple-100 text-purple-600",
                variant === "red" && "bg-red-100 text-red-600",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
