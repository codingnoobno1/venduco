// Base mobile-first button component
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "sm" | "md" | "lg"
    fullWidth?: boolean
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", fullWidth, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? "span" : "button"

        return (
            <Comp
                ref={asChild ? undefined : (ref as any)}
                className={cn(
                    // Base - Mobile first
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all",
                    "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",

                    // Variants
                    variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
                    variant === "outline" && "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
                    variant === "ghost" && "hover:bg-slate-100 text-slate-900",
                    variant === "link" && "text-blue-600 underline-offset-4 hover:underline",

                    // Sizes - Mobile optimized (larger touch targets)
                    size === "sm" && "h-10 px-4 text-sm", // min 40px for mobile
                    size === "md" && "h-12 px-6 text-base", // 48px - recommended mobile touch target
                    size === "lg" && "h-14 px-8 text-lg", // 56px - large mobile target

                    // Full width for mobile
                    fullWidth && "w-full",

                    className
                )}
                {...(asChild ? {} : props)}
            >
                {asChild && React.isValidElement(children)
                    ? React.cloneElement(children as React.ReactElement<{ className?: string }>, {
                        className: cn((children as React.ReactElement<{ className?: string }>).props.className)
                    })
                    : children}
            </Comp>
        )
    }
)

Button.displayName = "Button"

export { Button }
