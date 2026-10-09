"use client"

import { useState } from 'react'
import { AlertTriangle, Banknote, CheckCircle2, MapPinned, Route, TrendingUp } from 'lucide-react'
import {
    DenseTable, field, formatDate, formatMoney, Inspector, KeyValueList, MetricGrid, Panel, ProgressMeter,
    RefreshButton, SectionSkeleton, ServiceNotice, StatusPill, useApiSources, WorkspaceHeader, type BusinessRecord,
} from './RedesignKit'

const stages = ['Earthwork', 'Foundations', 'Piers', 'Deck', 'Track']

export default function CorridorWorkspace({ projectId }: { projectId: string }) {
    const { sources, loading, failed, refresh } = useApiSources([`/projects/${projectId}`, `/projects/${projectId}/corridor`, `/projects/${projectId}/continuity-gaps`])
    const [projectRows, segments, gaps] = sources
    const [selected, setSelected] = useState<BusinessRecord | null>(null)
    const project = projectRows[0]
    const detail = selected || segments[0]
    const progress = Number(field(project, ['progress', 'physicalProgress'], 0))
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Project corridor" title={String(field(project, ['name'], 'Corridor Progress'))} subtitle="Linear project view by work stage and chainage." actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Overall Weighted Progress', value: `${progress}%`, detail: `Baseline ${field(project, ['baselineProgress'], 0)}%`, icon: TrendingUp, tone: 'blue', progress },
            { label: 'Physical Progress', value: `${field(project, ['physicalProgress', 'progress'], 0)}%`, icon: Route, tone: 'blue', progress: Number(field(project, ['physicalProgress', 'progress'], 0)) },
            { label: 'Financial Progress', value: formatMoney(field(project, ['certifiedValue', 'spent'], 0)), detail: `of ${formatMoney(field(project, ['budget'], 0))}`, icon: Banknote, tone: 'violet' },
            { label: 'Inspected & Handed Over', value: field(project, ['handedOverLength'], 0), detail: `of ${field(project, ['totalLength'], 0)}`, icon: CheckCircle2, tone: 'green' },
            { label: 'Continuity Gaps', value: gaps.length, detail: 'Sections requiring action', icon: AlertTriangle, tone: gaps.length ? 'red' : 'green' },
        ]} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.8fr)]">
            <Panel title="Corridor Progress" subtitle="Linear project view by work stage">
                <div className="space-y-4 p-5">
                    {stages.map(stage => {
                        const relevant = segments.filter(item => String(field(item, ['stage', 'workStage'])).toLowerCase() === stage.toLowerCase())
                        return <div key={stage} className="grid grid-cols-[110px_1fr] items-center gap-3"><span className="text-xs font-semibold text-slate-700">{stage}</span><div className="flex h-7 overflow-hidden rounded-md bg-slate-100">{relevant.length ? relevant.map((segment, index) => <button key={String(field(segment, ['id', '_id'], index))} onClick={() => setSelected(segment)} title={String(field(segment, ['chainage', 'name']))} style={{ flexGrow: Number(field(segment, ['length'], 1)) }} className={`${String(field(segment, ['status'])).match(/BLOCK/) ? 'bg-red-400' : String(field(segment, ['status'])).match(/RISK/) ? 'bg-amber-400' : String(field(segment, ['status'])).match(/COMPLETE/) ? 'bg-emerald-400' : 'bg-blue-400'} border-r border-white/70 last:border-0`} />) : <span className="m-auto text-[10px] text-slate-400">No {stage.toLowerCase()} segments</span>}</div></div>
                    })}
                    <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500">{[['Completed','bg-emerald-400'],['Active','bg-blue-400'],['At Risk','bg-amber-400'],['Blocked','bg-red-400']].map(([label, color]) => <span key={label} className="flex items-center gap-1.5"><i className={`h-2.5 w-5 rounded ${color}`} />{label}</span>)}</div>
                </div>
            </Panel>
            <Inspector title={String(field(detail, ['chainage', 'name'], 'Select a section'))} status={field(detail, ['status'], undefined)}><KeyValueList rows={[
                ['Primary obstruction', field(detail, ['obstruction', 'issue', 'title'])], ['Owner', field(detail, ['ownerName', 'owner.name'])],
                ['Due date', formatDate(field(detail, ['dueDate']))], ['Impact', field(detail, ['impact'])], ['Resolution plan', field(detail, ['resolutionPlan'])],
            ]} /></Inspector>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Panel title={`Continuity Gaps (${gaps.length})`}><DenseTable records={gaps} onSelect={setSelected} columns={[
                { label: 'Chainage', keys: ['chainage', 'range'] }, { label: 'Length', keys: ['length'] }, { label: 'Issue', keys: ['issue', 'title'] },
                { label: 'Impact', keys: ['impact'] }, { label: 'Owner', keys: ['ownerName'] }, { label: 'Due Date', keys: ['dueDate'], render: record => formatDate(field(record, ['dueDate'])) },
                { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
            ]} /></Panel>
            <Panel title="Progress Definitions"><div className="space-y-4 p-4 text-xs text-slate-600"><div><strong className="text-slate-900">Physical Progress</strong><p className="mt-1">Weighted completion based on approved quantities.</p></div><div><strong className="text-slate-900">Financial Progress</strong><p className="mt-1">Certified work value compared with approved budget.</p></div></div></Panel>
        </div>
    </div>
}
