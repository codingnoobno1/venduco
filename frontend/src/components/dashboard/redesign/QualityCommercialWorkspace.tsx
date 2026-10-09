"use client"

import { AlertTriangle, Banknote, CalendarClock, ShieldAlert, TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
    DenseTable, field, formatDate, formatMoney, MetricGrid, Panel, ProgressMeter, RefreshButton,
    SectionSkeleton, ServiceNotice, StatusPill, useApiSources, WorkspaceHeader,
} from './RedesignKit'

export default function QualityCommercialWorkspace({ projectId }: { projectId: string }) {
    const { sources, loading, failed, refresh } = useApiSources([`/projects/${projectId}`, `/projects/${projectId}/progress-trend`, `/projects/${projectId}/ncrs?severity=CRITICAL`, `/projects/${projectId}/boq-progress`, `/projects/${projectId}/certifications`])
    const [projectRows, trend, ncrs, boq, certifications] = sources
    const project = projectRows[0]
    const physical = Number(field(project, ['physicalProgress', 'progress'], 0))
    const certified = certifications.reduce((sum, item) => sum + Number(field(item, ['certifiedValue', 'amount'], 0)), 0)
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Project control" title="Quality and Commercial Control" subtitle="Track physical progress, quality compliance and commercial certification in one place." actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Physical Actual (Executed)', value: `${physical}%`, detail: `${field(project, ['executedQuantity'], 0)} / ${field(project, ['baselineQuantity'], 0)} units`, icon: TrendingUp, tone: 'blue', progress: physical },
            { label: 'Certified Value', value: formatMoney(certified), detail: `of ${formatMoney(field(project, ['contractValue', 'budget'], 0))}`, icon: Banknote, tone: 'amber' },
            { label: 'Open Critical NCRs', value: ncrs.filter(item => !/CLOSED|RESOLVED/.test(String(item.status))).length, detail: `of ${ncrs.length} critical records`, icon: ShieldAlert, tone: 'red' },
            { label: 'Forecast Delay', value: `${field(project, ['forecastDelayDays', 'delayDays'], 0)} days`, detail: `Revised completion ${formatDate(field(project, ['forecastCompletionDate']))}`, icon: CalendarClock, tone: 'amber' },
        ]} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(380px,0.9fr)]">
            <div className="space-y-4">
                <Panel title="Physical Progress Trend (Planned vs Executed)">
                    {trend.length ? <div className="h-64 p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="period" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Line type="monotone" dataKey="plannedQuantity" name="Planned" stroke="#2563eb" strokeWidth={2.5} dot /><Line type="monotone" dataKey="executedQuantity" name="Executed" stroke="#10b981" strokeWidth={2.5} dot /></LineChart></ResponsiveContainer></div> : <div className="p-10 text-center text-sm text-slate-500">No progress trend has been recorded.</div>}
                </Panel>
                <Panel title="BOQ Quantity Progress"><DenseTable records={boq} columns={[
                    { label: 'BOQ Code', keys: ['boqCode', 'code'] }, { label: 'Description', keys: ['description', 'name'] }, { label: 'Unit', keys: ['unit'] },
                    { label: 'Baseline', keys: ['baselineQuantity'] }, { label: 'Executed', keys: ['executedQuantity'] }, { label: 'Inspected', keys: ['inspectedQuantity'] },
                    { label: 'Certified', keys: ['certifiedQuantity'] }, { label: '% Executed', keys: ['executedPercentage'], render: record => <ProgressMeter value={Number(field(record, ['executedPercentage'], 0))} /> },
                    { label: 'Variance', keys: ['variance'] },
                ]} /></Panel>
            </div>
            <div className="space-y-4">
                <Panel title="Critical NCR Register" action={<AlertTriangle size={18} className="text-red-500" />}><DenseTable records={ncrs} columns={[
                    { label: 'ID', keys: ['ncrNo', 'code'] }, { label: 'Package / Location', keys: ['packageName', 'location'] }, { label: 'Issue', keys: ['title', 'description'] },
                    { label: 'Severity', keys: ['severity'], render: record => <StatusPill value={field(record, ['severity'])} /> }, { label: 'Due', keys: ['dueDate'], render: record => formatDate(field(record, ['dueDate'])) },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} /></Panel>
                <Panel title="Commercial Certification"><DenseTable records={certifications} columns={[
                    { label: 'Cert No.', keys: ['certificateNo', 'code'] }, { label: 'Period', keys: ['period'] }, { label: 'Certified Value', keys: ['certifiedValue', 'amount'], render: record => formatMoney(field(record, ['certifiedValue', 'amount'], 0)) },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> }, { label: 'Payment Due', keys: ['paymentDueDate'], render: record => formatDate(field(record, ['paymentDueDate'])) },
                ]} /><div className="grid grid-cols-3 border-t border-slate-200 p-4 text-center"><div><p className="text-[10px] uppercase text-slate-500">Certified</p><p className="mt-1 font-bold">{formatMoney(certified)}</p></div><div><p className="text-[10px] uppercase text-slate-500">In certification</p><p className="mt-1 font-bold">{formatMoney(field(project, ['inCertificationValue'], 0))}</p></div><div><p className="text-[10px] uppercase text-slate-500">Balance</p><p className="mt-1 font-bold">{formatMoney(Math.max(0, Number(field(project, ['contractValue', 'budget'], 0)) - certified))}</p></div></div></Panel>
            </div>
        </div>
    </div>
}
