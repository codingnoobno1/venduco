"use client"

import { useEffect, useState } from 'react'

interface VendorServicesPanelProps {
    vendorId?: string
    services?: any
}

export function VendorServicesPanel({ vendorId, services: initial }: VendorServicesPanelProps) {
    const [services, setServices] = useState<any>(initial || null)
    const [loading, setLoading] = useState(!initial)

    useEffect(() => {
        if (!initial && vendorId) fetchServices()
    }, [vendorId])

    async function fetchServices() {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/vendors/${vendorId}/services`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) setServices(data.data)
        } catch (error) {
            console.error('Failed to fetch vendor services', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="py-4 text-sm text-slate-500">Loading services...</div>
    if (!services) return <div className="py-4 text-sm text-slate-500">No services available</div>

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.machineCategories?.map((cat: any) => (
                    <div key={cat.type} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <h4 className="font-medium">{cat.type}</h4>
                        <div className="text-sm text-slate-600 mt-2">
                            <div>Total: <span className="font-semibold">{cat.count}</span></div>
                            <div>Available: <span className="font-semibold text-green-600">{cat.available}</span></div>
                            {cat.avgDailyRate > 0 && <div>Avg: ₹{cat.avgDailyRate.toLocaleString()}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
