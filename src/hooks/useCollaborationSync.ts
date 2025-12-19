// Collaboration Sync Hook - Real-time collaboration updates
"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseCollaborationSyncOptions {
    pollInterval?: number
    enabled?: boolean
}

interface CollaborationUpdate {
    type: 'NEW_INVITE' | 'INVITE_ACCEPTED' | 'COLLABORATOR_ADDED' | 'PROJECT_SHARED'
    data: any
    timestamp: Date
}

export function useCollaborationSync({ pollInterval = 60000, enabled = true }: UseCollaborationSyncOptions = {}) {
    const [pendingInvites, setPendingInvites] = useState(0)
    const [updates, setUpdates] = useState<CollaborationUpdate[]>([])
    const [lastCheck, setLastCheck] = useState<Date | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchCollaborationStatus = useCallback(async () => {
        if (!enabled) return

        const token = localStorage.getItem('token')
        if (!token) return

        setIsLoading(true)

        try {
            const res = await fetch('/api/collaboration/invites?status=pending', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch collaboration status')

            const data = await res.json()
            if (data.success) {
                const newCount = data.counts?.pending || 0

                // Check if we have new invites since last check
                if (pendingInvites > 0 && newCount > pendingInvites) {
                    setUpdates(prev => [{
                        type: 'NEW_INVITE' as const,
                        data: { count: newCount - pendingInvites },
                        timestamp: new Date()
                    }, ...prev].slice(0, 20))
                }

                setPendingInvites(newCount)
                setLastCheck(new Date())
            }
        } catch (error) {
            console.error('Collaboration sync error:', error)
        } finally {
            setIsLoading(false)
        }
    }, [enabled, pendingInvites])

    useEffect(() => {
        if (!enabled) return

        fetchCollaborationStatus()
        const interval = setInterval(fetchCollaborationStatus, pollInterval)
        return () => clearInterval(interval)
    }, [enabled, pollInterval])

    const refresh = useCallback(() => {
        fetchCollaborationStatus()
    }, [fetchCollaborationStatus])

    const clearUpdates = useCallback(() => {
        setUpdates([])
    }, [])

    return {
        pendingInvites,
        updates,
        lastCheck,
        isLoading,
        refresh,
        clearUpdates,
    }
}
