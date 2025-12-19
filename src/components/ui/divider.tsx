// Divider Component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
    variant?: "solid" | "dashed" | "dotted"
    spacing?: "sm" | "md" | "lg"
}

export function Divider({
    variant = "solid",
    spacing = "md",
    className,
    ...props
}: DividerProps) {
    return (
        <hr
            className={cn(
                "border-slate-200",
                variant === "solid" && "border-solid",
                variant === "dashed" && "border-dashed",
                variant === "dotted" && "border-dotted",
                spacing === "sm" && "my-4",
                spacing === "md" && "my-6 sm:my-8",
                spacing === "lg" && "my-8 sm:my-12",
                className
            )}
            {...props}
        />
    )
}
