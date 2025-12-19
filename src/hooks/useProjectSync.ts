// Project Sync Hook - Real-time project updates
"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseProjectSyncOptions {
    projectId?: string
    pollInterval?: number // in milliseconds
    enabled?: boolean
}

interface ProjectUpdate {
    projectId: string
    type: 'STATUS_CHANGE' | 'PROGRESS_UPDATE' | 'MEMBER_ADDED' | 'BID_RECEIVED' | 'REPORT_SUBMITTED'
    data: any
    timestamp: Date
}

export function useProjectSync({ projectId, pollInterval = 30000, enabled = true }: UseProjectSyncOptions = {}) {
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [updates, setUpdates] = useState<ProjectUpdate[]>([])
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

            const res = await fetch(`/api/sync/projects?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error('Failed to fetch updates')

            const data = await res.json()
            if (data.success && data.updates?.length > 0) {
                setUpdates(prev => [...data.updates, ...prev].slice(0, 50)) // Keep last 50
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

        // Initial fetch
        fetchUpdates()

        // Set up polling
        const interval = setInterval(fetchUpdates, pollInterval)

        return () => clearInterval(interval)
    }, [enabled, pollInterval, projectId])

    const refresh = useCallback(() => {
        fetchUpdates()
    }, [fetchUpdates])

    const clearUpdates = useCallback(() => {
        setUpdates([])
    }, [])

    return {
        updates,
        lastUpdate,
        isPolling,
        error,
        refresh,
        clearUpdates,
    }
}
