// Stakeholder logo display component
"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface StakeholderLogoProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
}

export function StakeholderLogo({ src, alt, width = 120, height = 60, className }: StakeholderLogoProps) {
    return (
        <div className={cn("relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100", className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="object-contain"
            />
        </div>
    )
}
