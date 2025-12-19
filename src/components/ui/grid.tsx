// Responsive grid component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: "1" | "2" | "3" | "4"
    gap?: "sm" | "md" | "lg"
}

export function Grid({
    cols = "3",
    gap = "md",
    className,
    ...props
}: GridProps) {
    return (
        <div
            className={cn(
                "grid",
                cols === "1" && "grid-cols-1",
                cols === "2" && "grid-cols-1 sm:grid-cols-2",
                cols === "3" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                cols === "4" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
                gap === "sm" && "gap-4",
                gap === "md" && "gap-4 sm:gap-6 md:gap-8",
                gap === "lg" && "gap-6 sm:gap-8 md:gap-10",
                className
            )}
            {...props}
        />
    )
}
