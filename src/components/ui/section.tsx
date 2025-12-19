// Mobile-first section component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    variant?: "default" | "dark" | "gradient"
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <section
            ref={ref}
            className={cn(
                "py-12 sm:py-16 md:py-20",
                variant === "default" && "bg-white",
                variant === "dark" && "bg-slate-900 text-white",
                variant === "gradient" && "bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white",
                className
            )}
            {...props}
        />
    )
)

Section.displayName = "Section"

export { Section }
