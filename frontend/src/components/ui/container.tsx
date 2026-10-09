// Mobile-first container component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full"
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, maxWidth = "lg", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "mx-auto px-4 sm:px-6",
                maxWidth === "sm" && "max-w-2xl",
                maxWidth === "md" && "max-w-4xl",
                maxWidth === "lg" && "max-w-6xl",
                maxWidth === "xl" && "max-w-7xl",
                maxWidth === "full" && "max-w-full",
                className
            )}
            {...props}
        />
    )
)

Container.displayName = "Container"

export { Container }
