"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    return <div className="group relative inline-block">{children}</div>
}

const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    return <>{children}</>
}

const TooltipContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`invisible group-hover:visible absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 rounded shadow-sm -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap ${className}`}>
            {children}
        </div>
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
