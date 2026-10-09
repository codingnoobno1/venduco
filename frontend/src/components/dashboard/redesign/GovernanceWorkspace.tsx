"use client"

import { useState } from 'react'
import { Plus, ShieldCheck, Users } from 'lucide-react'
import {
    DenseTable, field, formatDate, formatMoney, Inspector, KeyValueList, MetricGrid, Panel, PrimaryButton,
    RefreshButton, SectionSkeleton, ServiceNotice, StatusPill, useApiSources, WorkspaceHeader, type BusinessRecord,
} from './RedesignKit'

export default function GovernanceWorkspace({ projectId }: { projectId?: string }) {
    const projectQuery = projectId ? `?projectId=${projectId}` : ''
    const { sources, loading, failed, refresh } = useApiSources([`/governance/roles${projectQuery}`, `/governance/appointments${projectQuery}`, `/governance/approval-chain${projectQuery}`])
    const [roles, appointments, chain] = sources
    const [selected, setSelected] = useState<BusinessRecord | null>(null)
    const detail = selected || appointments[0]
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Governance" title="Roles and approvals" subtitle="Define role scope, decision rights and approval flow for this project." actions={<><RefreshButton loading={loading} onClick={refresh} /><PrimaryButton><Plus size={16} /> Assign role</PrimaryButton></>} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Defined roles', value: roles.length, detail: 'Project governance roles', icon: ShieldCheck, tone: 'blue' },
            { label: 'Active appointments', value: appointments.filter(item => /ACTIVE|APPROVED/.test(String(item.status))).length, detail: `${appointments.length} total appointments`, icon: Users, tone: 'green' },
            { label: 'Expiring access', value: appointments.filter(item => /EXPIR/.test(String(item.status))).length, detail: 'Requires review', icon: ShieldCheck, tone: 'amber' },
            { label: 'Approval stages', value: chain.length, detail: 'Configured decision flow', icon: ShieldCheck, tone: 'violet' },
        ]} />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <Panel title="Role authority matrix">
                <DenseTable records={roles} onSelect={setSelected} columns={[
                    { label: 'Role', keys: ['label', 'roleName', 'role'] }, { label: 'Scope', keys: ['scopeDescription', 'scope'] },
                    { label: 'Create', keys: ['createPermissions'] }, { label: 'Review', keys: ['reviewPermissions'] }, { label: 'Approve', keys: ['approvePermissions'] },
                    { label: 'Visibility', keys: ['visibility'] },
                ]} />
            </Panel>
            <Inspector title="Project appointment" status={field(detail, ['status'], undefined)}><KeyValueList rows={[
                ['Role', field(detail, ['roleName', 'role'])], ['Appointee', field(detail, ['appointeeName', 'user.fullName'])], ['Organization', field(detail, ['organizationName'])],
                ['Project', field(detail, ['projectName'])], ['Appointment date', formatDate(field(detail, ['appointmentDate', 'createdAt']))], ['Access expires', formatDate(field(detail, ['accessExpiresAt']))],
                ['Access level', field(detail, ['accessLevel'])], ['Approval limit', formatMoney(field(detail, ['approvalLimit'], 0))], ['Reviewer', field(detail, ['reviewerName'])],
            ]} /></Inspector>
        </div>
        <Panel title="Approval chain" subtitle="Configured submission, review, recommendation and approval stages">
            {chain.length ? <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">{chain.map((step, index) => <div key={String(field(step, ['id', 'sequence'], index))} className="relative rounded-xl border border-slate-200 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span><h3 className="mt-3 text-sm font-bold">{field(step, ['roleName', 'name'])}</h3><p className="mt-1 text-xs text-slate-500">{field(step, ['action', 'description'])}</p><div className="mt-4"><StatusPill value={field(step, ['status'])} /></div></div>)}</div> : <div className="p-8 text-center text-sm text-slate-500">No approval chain has been configured.</div>}
        </Panel>
    </div>
}
