// Bid Sync Hook - Real-time bid updates
"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseBidSyncOptions {
    projectId?: string
    pollInterval?: number
    enabled?: boolean
}

interface BidUpdate {
    bidId: string
    projectId: string
    type: 'NEW_BID' | 'BID_STATUS_CHANGE' | 'BID_WITHDRAWN' | 'INVITATION_RECEIVED'
    data: any
    timestamp: Date
}

export function useBidSync({ projectId, pollInterval = 30000, enabled = true }: UseBidSyncOptions = {}) {
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [updates, setUpdates] = useState<BidUpdate[]>([])
    const [newBidCount, setNewBidCount] = useState(0)
    const [isPolling, setIsPolling] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUpdates = useCallback(async () => {
        if (!enabled) return

        const token = localStorage.getItem('token')
        if (!token) return

        setIsPolling(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (projectId) params.append('projectId', projectId)
            if (lastUpdate) params.append('since', lastUpdate.toISOString())

            const res = await fetch(`/api/sync/bids?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch bid updates')

            const data = await res.json()
            if (data.success && data.updates?.length > 0) {
                setUpdates(prev => [...data.updates, ...prev].slice(0, 50))
                setNewBidCount(prev => prev + data.updates.filter((u: BidUpdate) => u.type === 'NEW_BID').length)
                setLastUpdate(new Date())
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsPolling(false)
        }
    }, [projectId, lastUpdate, enabled])

    useEffect(() => {
        if (!enabled) return

        fetchUpdates()
        const interval = setInterval(fetchUpdates, pollInterval)
        return () => clearInterval(interval)
    }, [enabled, pollInterval, projectId])

    const refresh = useCallback(() => {
        fetchUpdates()
    }, [fetchUpdates])

    const clearNewBidCount = useCallback(() => {
        setNewBidCount(0)
    }, [])

    const clearUpdates = useCallback(() => {
        setUpdates([])
        setNewBidCount(0)
    }, [])

    return {
        updates,
        newBidCount,
        lastUpdate,
        isPolling,
        error,
        refresh,
        clearNewBidCount,
        clearUpdates,
    }
}
