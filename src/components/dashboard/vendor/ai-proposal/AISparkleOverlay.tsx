"use client"

import React from 'react'

export function AISparkleOverlay() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500 blur-[120px] rounded-full" />
        </div>
    )
}
