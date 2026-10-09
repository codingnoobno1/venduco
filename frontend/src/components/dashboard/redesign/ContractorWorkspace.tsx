"use client"

import { AlertTriangle, Banknote, CalendarClock, FileClock, Layers3 } from 'lucide-react'
import {
    DenseTable, field, formatDate, formatMoney, MetricGrid, Panel, ProgressMeter, RefreshButton,
    SectionSkeleton, ServiceNotice, StatusPill, useApiSources, WorkspaceHeader,
} from './RedesignKit'

export default function ContractorWorkspace() {
    const { sources, loading, failed, refresh } = useApiSources(['/work-packages/assigned', '/material-constraints', '/subcontractor-submissions', '/inspections/assigned'])
    const [packages, materials, submissions, inspections] = sources
    const contractValue = packages.reduce((sum, item) => sum + Number(field(item, ['contractValue', 'plannedValue', 'budget'], 0)), 0)
    const certified = packages.reduce((sum, item) => sum + Number(field(item, ['certifiedValue', 'actualValue'], 0)), 0)
    const progress = contractValue ? (certified / contractValue) * 100 : 0
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Delivery" title="Contractor Dashboard" subtitle="Delivery, subcontractor performance and package progress." actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Awarded Contract Value', value: formatMoney(contractValue), icon: Banknote, tone: 'blue' },
            { label: 'Certified Work to Date', value: formatMoney(certified), detail: `${Math.round(progress)}% of awarded value`, icon: Layers3, tone: 'green', progress },
            { label: 'Forecast Delay', value: `${Math.max(0, ...packages.map(item => Number(field(item, ['forecastDelayDays', 'delayDays'], 0))))} days`, icon: CalendarClock, tone: 'red' },
            { label: 'Pending Subcontractor Claims', value: submissions.filter(item => !/APPROVED|CLOSED/.test(String(item.status))).length, detail: `${submissions.length} total submissions`, icon: FileClock, tone: 'amber' },
        ]} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.8fr)]">
            <div className="space-y-4">
                <Panel title="Work Packages" subtitle="Progress by package and subcontractor">
                    <DenseTable records={packages} columns={[
                        { label: 'Package', keys: ['code', 'name', 'title'] }, { label: 'Subcontractor', keys: ['subcontractorName', 'vendorName'] },
                        { label: 'Planned', keys: ['plannedQuantity', 'plannedValue'] }, { label: 'Actual', keys: ['actualQuantity', 'actualValue'] },
                        { label: 'Progress', keys: ['progress'], render: record => <ProgressMeter value={Number(field(record, ['progress', 'completionPercentage'], 0))} /> },
                        { label: 'Next milestone', keys: ['nextMilestone.name', 'nextMilestone'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                    ]} />
                </Panel>
                <Panel title="Consultant Inspection Status" subtitle="Contractors cannot approve their own inspections">
                    <DenseTable records={inspections} columns={[
                        { label: 'ID', keys: ['inspectionNo', 'code'] }, { label: 'Area / Package', keys: ['area', 'packageName'] },
                        { label: 'Inspection Type', keys: ['inspectionType', 'type'] }, { label: 'Consultant', keys: ['consultantName', 'reviewerName'] },
                        { label: 'Date', keys: ['inspectionDate', 'createdAt'], render: record => formatDate(field(record, ['inspectionDate', 'createdAt'])) },
                        { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> }, { label: 'Remarks', keys: ['remarks', 'comment'] },
                    ]} />
                </Panel>
            </div>
            <div className="space-y-4">
                <Panel title="Material Constraints"><DenseTable records={materials} columns={[
                    { label: 'Material', keys: ['materialName', 'name'] }, { label: 'Required', keys: ['requiredQuantity', 'required'] },
                    { label: 'Available', keys: ['availableQuantity', 'available'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} /></Panel>
                <Panel title="Subcontractor Submissions"><DenseTable records={submissions} columns={[
                    { label: 'ID', keys: ['submissionNo', 'code'] }, { label: 'Subcontractor', keys: ['subcontractorName', 'vendorName'] },
                    { label: 'Type', keys: ['type', 'submissionType'] }, { label: 'Submitted', keys: ['submittedAt'], render: record => formatDate(field(record, ['submittedAt'])) },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} /></Panel>
            </div>
        </div>
    </div>
}
