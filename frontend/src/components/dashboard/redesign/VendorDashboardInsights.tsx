"use client"

import { DenseTable, field, formatDate, formatMoney, Panel, ProgressMeter, StatusPill, useApiSources } from './RedesignKit'

export default function VendorDashboardInsights() {
    const { sources } = useApiSources(['/vendor/billing/summary?period=month', '/machinerentals?view=vendor-requests', '/machinerentals?view=upcoming'])
    const [billingRows, requests, mobilizations] = sources
    const billing = billingRows[0]
    const aging = Array.isArray(billing?.aging) ? billing.aging : []
    const invoiceStatus = Array.isArray(billing?.invoiceStatus) ? billing.invoiceStatus : []
    return <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Rental Requests Queue"><DenseTable records={requests.slice(0, 6)} columns={[
            { label: '#', keys: ['requestNo', 'code', 'id'] }, { label: 'Equipment', keys: ['machineType', 'equipmentName'] }, { label: 'Project / Location', keys: ['projectName', 'location'] },
            { label: 'Qty', keys: ['quantity'] }, { label: 'Start Date', keys: ['startDate'], render: record => formatDate(field(record, ['startDate'])) }, { label: 'Duration', keys: ['duration'] },
            { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
        <Panel title="Invoice Aging"><div className="p-4"><p className="text-3xl font-bold text-slate-950">{formatMoney(field(billing, ['totalOutstanding'], 0))}</p><p className="text-xs text-slate-500">Total outstanding</p>{aging.length ? <div className="mt-4 space-y-3">{aging.map((bucket: any, index: number) => <div key={String(bucket.label || index)}><div className="mb-1 flex justify-between text-xs"><span>{field(bucket, ['label', 'bucket'])}</span><strong>{formatMoney(field(bucket, ['amount'], 0))}</strong></div><ProgressMeter value={Number(field(bucket, ['percentage'], 0))} tone={index === 0 ? 'red' : index === 1 ? 'amber' : 'blue'} /></div>)}</div> : <p className="py-8 text-center text-sm text-slate-500">No invoice aging data.</p>}</div><div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">{invoiceStatus.map((item: any, index: number) => <div key={String(item.status || index)} className="bg-white p-3"><p className="text-xl font-bold">{field(item, ['count'], 0)}</p><p className="text-[11px] text-slate-500">{field(item, ['status', 'label'])}</p><p className="mt-1 text-xs font-semibold">{formatMoney(field(item, ['amount'], 0))}</p></div>)}</div></Panel>
        <Panel title="Upcoming Mobilizations" className="xl:col-span-2"><DenseTable records={mobilizations.slice(0, 8)} columns={[
            { label: 'Date', keys: ['mobilizationDate', 'startDate'], render: record => formatDate(field(record, ['mobilizationDate', 'startDate'])) }, { label: 'Equipment', keys: ['machineType', 'equipmentName'] },
            { label: 'Project / Location', keys: ['projectName', 'location'] }, { label: 'Qty', keys: ['quantity'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
        ]} /></Panel>
    </section>
}
