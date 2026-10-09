"use client"

import { DenseTable, field, Panel, ProgressMeter, ServiceNotice, StatusPill, useApiSources } from './RedesignKit'

export default function ProjectControlSummary({ projectId }: { projectId: string }) {
    const { sources, failed } = useApiSources([`/projects/${projectId}/milestones`, `/issues?projectId=${projectId}`, `/tasks?projectId=${projectId}`])
    const [milestones, issues, tasks] = sources
    return <div className="col-span-full space-y-4"><ServiceNotice failed={failed} /><div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Upcoming Milestones"><DenseTable records={milestones.slice(0, 6)} columns={[
            { label: 'Milestone', keys: ['name', 'title'] }, { label: 'Planned Date', keys: ['plannedDate', 'dueDate'] }, { label: 'Forecast Date', keys: ['forecastDate'] },
            { label: 'Progress', keys: ['progress'], render: record => <ProgressMeter value={Number(field(record, ['progress'], 0))} /> }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
        <Panel title="Blockers & Risks"><DenseTable records={issues.slice(0, 6)} columns={[
            { label: 'Issue / Risk', keys: ['title', 'description'] }, { label: 'Impact', keys: ['impact', 'severity'] }, { label: 'Owner', keys: ['ownerName', 'assignedToName'] },
            { label: 'Due Date', keys: ['dueDate'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
        <Panel title="My Review Tasks" className="xl:col-span-2"><DenseTable records={tasks.slice(0, 8)} columns={[
            { label: 'Task', keys: ['title', 'name'] }, { label: 'Owner', keys: ['ownerName', 'assignedToName'] }, { label: 'Due Date', keys: ['dueDate'] },
            { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
    </div></div>
}
