// Mobile hamburger menu icon animation
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileMenuIconProps {
    isOpen: boolean
    className?: string
}

export function MobileMenuIcon({ isOpen, className }: MobileMenuIconProps) {
    return (
        <div className={cn("w-6 h-5 flex flex-col justify-between", className)}>
            <span
                className={cn(
                    "w-full h-0.5 bg-current transition-all duration-300 ease-out",
                    isOpen && "rotate-45 translate-y-2"
                )}
            />
            <span
                className={cn(
                    "w-full h-0.5 bg-current transition-all duration-300 ease-out",
                    isOpen && "opacity-0"
                )}
            />
            <span
                className={cn(
                    "w-full h-0.5 bg-current transition-all duration-300 ease-out",
                    isOpen && "-rotate-45 -translate-y-2"
                )}
            />
        </div>
    )
}
