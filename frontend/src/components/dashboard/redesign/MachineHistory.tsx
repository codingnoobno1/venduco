"use client"

import { DenseTable, field, formatDate, Panel, StatusPill, useApiSources } from './RedesignKit'

export default function MachineHistory({ machineId, kind }: { machineId: string; kind: 'assignments' | 'maintenance' }) {
    const { sources } = useApiSources([`/machines/${machineId}/${kind}`])
    const records = sources[0]
    const columns = kind === 'assignments' ? [
        { label: 'Assignment', keys: ['assignmentNo', 'code', 'id'] }, { label: 'Project', keys: ['projectName'] }, { label: 'Location', keys: ['location'] },
        { label: 'Start', keys: ['startDate'], render: (record: any) => formatDate(field(record, ['startDate'])) }, { label: 'End', keys: ['endDate'], render: (record: any) => formatDate(field(record, ['endDate'])) },
        { label: 'Operator', keys: ['operatorName'] }, { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ] : [
        { label: 'Service', keys: ['serviceNo', 'code', 'id'] }, { label: 'Type', keys: ['serviceType', 'type'] }, { label: 'Date', keys: ['serviceDate', 'createdAt'], render: (record: any) => formatDate(field(record, ['serviceDate', 'createdAt'])) },
        { label: 'Hours', keys: ['meterHours', 'totalHours'] }, { label: 'Provider', keys: ['providerName', 'workshopName'] }, { label: 'Next Due', keys: ['nextDueDate'], render: (record: any) => formatDate(field(record, ['nextDueDate'])) },
        { label: 'Status', keys: ['status'], render: (record: any) => <StatusPill value={field(record, ['status'])} /> },
    ]
    return <Panel title={kind === 'assignments' ? 'Assignment History' : 'Maintenance & Service Record'}><DenseTable records={records} columns={columns} /></Panel>
}
