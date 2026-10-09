// Location pin component for geography display
"use client"

import * as React from "react"

interface LocationPinProps {
    city: string
}

export function LocationPin({ city }: LocationPinProps) {
    return (
        <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 flex-shrink-0" />
            <span className="text-sm sm:text-base text-slate-700">{city}</span>
        </div>
    )
}
