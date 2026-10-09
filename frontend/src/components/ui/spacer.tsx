// Spacer component for vertical rhythm
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "xs" | "sm" | "md" | "lg" | "xl"
}

export function Spacer({ size = "md", className, ...props }: SpacerProps) {
    return (
        <div
            className={cn(
                size === "xs" && "h-2 sm:h-4",
                size === "sm" && "h-4 sm:h-6",
                size === "md" && "h-6 sm:h-8",
                size === "lg" && "h-8 sm:h-12",
                size === "xl" && "h-12 sm:h-16",
                className
            )}
            {...props}
        />
    )
}
