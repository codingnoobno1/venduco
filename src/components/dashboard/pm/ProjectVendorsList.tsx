"use client"

import { useEffect, useState } from 'react'
import { CollaboratorCard } from '@/components/dashboard/pm/CollaboratorCard'

interface ProjectVendorsListProps {
    projectId: string
}

export function ProjectVendorsList({ projectId }: ProjectVendorsListProps) {
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVendors()
    }, [projectId])

    async function fetchVendors() {
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/vendors`, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) setVendors(data.data || [])
        } catch (error) {
            console.error('Failed to fetch project vendors', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="py-6 text-sm text-slate-500">Loading vendors...</div>

    if (vendors.length === 0) return <div className="py-6 text-sm text-slate-500">No vendors on this project</div>

    return (
        <div className="grid grid-cols-1 gap-3">
            {vendors.map((v: any) => (
                <CollaboratorCard
                    key={v.userId || v._id}
                    collaborator={{
                        userId: v.userId || v._id,
                        userName: v.userName || v.name || v.businessName || 'Vendor',
                        userEmail: v.userEmail || v.email,
                        role: 'VENDOR' as any,
                        status: 'ACCEPTED',
                    }}
                    isAdminView={false}
                />
            ))}
        </div>
    )
}
