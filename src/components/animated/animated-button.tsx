// Professional animated button component
"use client"

import { motion } from "framer-motion"
import { type ReactNode } from "react"

interface AnimatedButtonProps {
    children: ReactNode
    variant?: "primary" | "secondary" | "outline"
    size?: "sm" | "md" | "lg"
    onClick?: () => void
    href?: string
    className?: string
}

export function AnimatedButton({
    children,
    variant = "primary",
    size = "md",
    onClick,
    href,
    className = ""
}: AnimatedButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all"

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60",
        secondary: "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400",
        outline: "bg-white/20 backdrop-blur-md text-white border-2 border-white/80 hover:bg-white/30 hover:border-white shadow-lg"
    }

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    }

    const Component = href ? motion.a : motion.button

    return (
        <Component
            href={href}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            {children}
        </Component>
    )
}
