"use client"

import { useState } from 'react'
import { AlertTriangle, BarChart3, Target, Truck, Users } from 'lucide-react'
import apiRequest from '@/lib/api'
import {
    DenseTable, field, MetricGrid, Panel, PrimaryButton, ProgressMeter, RefreshButton, SectionSkeleton,
    ServiceNotice, StatusPill, useApiSources, WorkspaceHeader,
} from './RedesignKit'

export default function SubcontractorWorkspace() {
    const { sources, loading, failed, refresh } = useApiSources(['/work-packages/assigned', '/tasks/assigned', '/reports/my', '/issues'])
    const [packages, activities, reports, issues] = sources
    const [quantity, setQuantity] = useState('')
    const [location, setLocation] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const currentPackage = packages[0]
    const completed = activities.filter(item => /COMPLETED/.test(String(item.status))).length
    const target = Number(field(currentPackage, ['todayTarget', 'targetQuantity'], 0))
    const actual = activities.reduce((sum, item) => sum + Number(field(item, ['actualQuantity', 'completedQuantity'], 0)), 0)

    async function addQuantity() {
        if (!currentPackage || !quantity) return
        setSubmitting(true)
        try {
            await apiRequest('/reports/daily', { method: 'POST', body: { workPackageId: field(currentPackage, ['id', '_id']), quantity: Number(quantity), location } })
            setQuantity('')
            setLocation('')
            refresh()
        } finally { setSubmitting(false) }
    }

    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Assigned work" title={String(field(currentPackage, ['name', 'title'], 'Subcontractor Work Desk'))} subtitle="Daily quantities, resources, evidence, inspections and claims." actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: "Today's Target", value: target, detail: `${actual} actual`, icon: Target, tone: 'blue', progress: target ? actual / target * 100 : 0 },
            { label: 'Crew Present', value: field(currentPackage, ['crewPresent'], 0), detail: 'Available today', icon: Users, tone: 'green' },
            { label: 'Plant Operational', value: field(currentPackage, ['plantOperational'], 0), detail: 'In working condition', icon: Truck, tone: 'green' },
            { label: 'Package Progress', value: `${field(currentPackage, ['progress', 'completionPercentage'], 0)}%`, detail: `${completed}/${activities.length} activities completed`, icon: BarChart3, tone: 'blue', progress: Number(field(currentPackage, ['progress', 'completionPercentage'], 0)) },
        ]} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.8fr)]">
            <Panel title="My Assigned Activities">
                <DenseTable records={activities} columns={[
                    { label: '#', keys: ['sequence', 'id'] }, { label: 'Activity / Location', keys: ['title', 'name', 'location'] },
                    { label: 'Planned Quantity', keys: ['plannedQuantity'] }, { label: "Today's Target", keys: ['targetQuantity'] },
                    { label: "Today's Actual", keys: ['actualQuantity'] }, { label: 'Unit', keys: ['unit'] }, { label: 'Due Date', keys: ['dueDate'] },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} />
            </Panel>
            <div className="space-y-4">
                <Panel title="Daily Quantity Entry"><div className="grid gap-3 p-4">
                    <select className="h-10 rounded-lg border border-slate-200 px-3 text-sm" disabled={!activities.length}>{activities.map(item => <option key={String(field(item, ['id', '_id']))}>{field(item, ['title', 'name'])}</option>)}</select>
                    <input type="number" min="0" value={quantity} onChange={event => setQuantity(event.target.value)} placeholder="Quantity" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                    <input value={location} onChange={event => setLocation(event.target.value)} placeholder="Work location / chainage" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                    <PrimaryButton onClick={addQuantity} disabled={!currentPackage || !quantity || submitting}>{submitting ? 'Saving…' : 'Add to report'}</PrimaryButton>
                </div></Panel>
                <Panel title="Blockers / Issues" action={<AlertTriangle size={18} className="text-red-500" />}><DenseTable records={issues.slice(0, 4)} columns={[
                    { label: 'Issue', keys: ['title', 'description'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} /></Panel>
            </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
            <Panel title="Today's Site Summary"><div className="p-4"><ProgressMeter value={target ? actual / target * 100 : 0} /><p className="mt-3 text-xs text-slate-500">{actual} of {target} target quantity recorded.</p></div></Panel>
            <Panel title="Inspection Request"><div className="p-4 text-sm text-slate-600">{field(currentPackage, ['inspectionStatus'], 'No inspection request submitted')}</div></Panel>
            <Panel title="Payment Claim"><div className="p-4 text-sm text-slate-600">{field(reports[0], ['claimStatus', 'status'], 'No payment claim submitted')}</div></Panel>
        </div>
    </div>
}
