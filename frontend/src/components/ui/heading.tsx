// Heading component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    size?: "sm" | "md" | "lg" | "xl"
}

export function Heading({
    as: Tag = "h2",
    size = "md",
    className,
    ...props
}: HeadingProps) {
    return (
        <Tag
            className={cn(
                "font-bold text-slate-900 leading-tight",
                size === "sm" && "text-lg sm:text-xl",
                size === "md" && "text-xl sm:text-2xl md:text-3xl",
                size === "lg" && "text-2xl sm:text-3xl md:text-4xl",
                size === "xl" && "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
                className
            )}
            {...props}
        />
    )
}
