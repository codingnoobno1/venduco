"use client"

import React from 'react'
import { RequirementCard } from './RequirementCard'

export function RequirementsList() {
    const requirements = [
        { title: "Technical Compliance", description: "All machinery must meet Euro VI emission standards and have valid certifications." },
        { title: "Financial Stability", description: "Minimum annual turnover of $5M over the last three financial years." },
        { title: "Past Experience", description: "At least 3 similar projects completed within the last 5 years." },
        { title: "Safety Standards", description: "ISO 45001 certification required for all site personnel." }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req, i) => (
                <RequirementCard key={i} title={req.title} description={req.description} />
            ))}
        </div>
    )
}
