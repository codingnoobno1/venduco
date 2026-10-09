"use client"

import { field, formatDate, Panel, StatusPill, type BusinessRecord } from './RedesignKit'

function asTime(value: unknown) {
    const time = new Date(String(value || '')).getTime()
    return Number.isFinite(time) ? time : null
}

export default function PortfolioSchedule({ projects }: { projects: BusinessRecord[] }) {
    const dated = projects.map(project => ({
        project,
        start: asTime(field(project, ['startDate', 'baselineStart'], null)),
        end: asTime(field(project, ['deadline', 'endDate', 'baselineEnd'], null)),
    })).filter(item => item.start !== null && item.end !== null) as Array<{ project: BusinessRecord; start: number; end: number }>
    const min = dated.length ? Math.min(...dated.map(item => item.start)) : 0
    const max = dated.length ? Math.max(...dated.map(item => item.end)) : 0
    const span = Math.max(1, max - min)

    return <Panel title="Portfolio Schedule" subtitle="Project timelines across the permitted portfolio">
        {dated.length ? <div className="overflow-x-auto p-4"><div className="min-w-[760px] space-y-2">{dated.map(({ project, start, end }) => {
            const left = (start - min) / span * 100
            const width = Math.max(1.5, (end - start) / span * 100)
            return <div key={String(field(project, ['id', '_id', 'projectCode']))} className="grid grid-cols-[190px_100px_100px_1fr] items-center gap-3 text-xs"><div><p className="truncate font-semibold text-slate-800">{field(project, ['name'])}</p><StatusPill value={field(project, ['status'])} /></div><span className="text-slate-500">{formatDate(start)}</span><span className="text-slate-500">{formatDate(end)}</span><div className="relative h-8 rounded bg-slate-50"><div className="absolute top-2 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-400" style={{ left: `${left}%`, width: `${width}%` }} /><i className="absolute top-1.5 h-5 w-px bg-blue-900/25" style={{ left: `${left + width}%` }} /></div></div>
        })}</div></div> : <div className="p-10 text-center text-sm text-slate-500">No projects have a complete baseline schedule.</div>}
    </Panel>
}
