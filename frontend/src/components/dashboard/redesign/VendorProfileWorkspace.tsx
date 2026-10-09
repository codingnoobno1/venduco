"use client"

import { useState } from 'react'
import { Building2, FileCheck2, MapPin, Settings2, Truck, Users } from 'lucide-react'
import {
    DenseTable, field, formatDate, Inspector, KeyValueList, MetricGrid, Panel, ProgressMeter,
    RefreshButton, SectionSkeleton, ServiceNotice, StatusPill, TabStrip, useApiSources, WorkspaceHeader,
} from './RedesignKit'

export default function VendorProfileWorkspace({ vendorId }: { vendorId: string }) {
    const endpoints = [`/vendors/${vendorId}`, `/vendors/${vendorId}/capacity`, `/vendors/${vendorId}/documents`, `/vendors/${vendorId}/projects`, `/vendors/${vendorId}/activity`]
    const { sources, loading, failed, refresh } = useApiSources(endpoints)
    const [tab, setTab] = useState('Company')
    const [profileRows, capacity, documents, projects, activity] = sources
    const profile = profileRows[0]
    const services = Array.isArray(profile?.services) ? profile.services : []
    const areas = Array.isArray(profile?.serviceAreas) ? profile.serviceAreas : []
    if (loading) return <SectionSkeleton />
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="Vendor directory" title={String(field(profile, ['companyName', 'name'], 'Vendor Profile'))} subtitle={[field(profile, ['categories'], ''), field(profile, ['location', 'registeredAddress.city'], '')].filter(Boolean).join(' · ') || 'Company capability, documents and project history.'} actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <MetricGrid items={[
            { label: 'Vendor status', value: <StatusPill value={field(profile, ['status'], 'Pending')} />, detail: 'Current registration state', icon: Building2, tone: 'green' },
            { label: 'Services offered', value: services.length, detail: 'Registered service categories', icon: Settings2, tone: 'blue' },
            { label: 'Service areas', value: areas.length, detail: 'Operational regions', icon: MapPin, tone: 'violet' },
            { label: 'Completed references', value: projects.filter(item => /COMPLETED/.test(String(item.status))).length, detail: `${projects.length} project references`, icon: FileCheck2, tone: 'green' },
        ]} />
        <TabStrip tabs={['Company', 'Experience', 'Capacity', 'Documents', 'Performance']} active={tab} onChange={setTab} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
                <Panel title="Company Snapshot"><div className="grid md:grid-cols-2"><KeyValueList rows={[
                    ['Legal entity type', field(profile, ['legalEntityType', 'companyType'])], ['Year established', field(profile, ['yearEstablished'])],
                    ['Registration number', field(profile, ['registrationNumber', 'cin'])], ['Registered address', field(profile, ['registeredAddress', 'address'])],
                ]} /><KeyValueList rows={[
                    ['Authorised contact', field(profile, ['contact.name', 'contactName'])], ['Designation', field(profile, ['contact.designation', 'designation'])],
                    ['Phone', field(profile, ['contact.phone', 'phone'])], ['Email', field(profile, ['contact.email', 'email'])],
                ]} /></div></Panel>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Panel title="Services Offered"><div className="grid gap-3 p-4 sm:grid-cols-2">{services.length ? services.map((service: any, index: number) => <div key={String(service.id || service.name || index)} className="rounded-lg border border-slate-200 p-3"><Truck size={20} className="text-blue-600" /><p className="mt-2 text-sm font-semibold">{field(service, ['name', 'category'])}</p><p className="mt-1 text-xs text-slate-500">{field(service, ['description', 'equipmentTypes'])}</p></div>) : <p className="col-span-full py-8 text-center text-sm text-slate-500">No registered services.</p>}</div></Panel>
                    <Panel title="Current Available Capacity"><div className="space-y-4 p-4">{capacity.length ? capacity.map((item, index) => <div key={String(field(item, ['id', 'equipmentType'], index))}><div className="mb-1 flex justify-between text-xs"><span className="font-medium">{field(item, ['equipmentType', 'name'])}</span><span>{field(item, ['available'], 0)} / {field(item, ['total'], 0)}</span></div><ProgressMeter value={Number(field(item, ['utilization', 'availabilityPercentage'], 0))} /></div>) : <p className="py-8 text-center text-sm text-slate-500">No capacity records.</p>}</div></Panel>
                </div>
                <Panel title="Completed Project References"><DenseTable records={projects} columns={[
                    { label: 'Project', keys: ['projectName', 'name'] }, { label: 'Client', keys: ['clientName', 'client'] }, { label: 'Location', keys: ['location'] },
                    { label: 'Services', keys: ['services'] }, { label: 'Value', keys: ['contractValue', 'value'] }, { label: 'Period', keys: ['period'] },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} /></Panel>
            </div>
            <div className="space-y-4">
                <Inspector title="Service Areas"><div className="p-4">{areas.length ? <div className="flex flex-wrap gap-2">{areas.map((area: any, index: number) => <span key={String(area.id || area.name || index)} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{field(area, ['name', 'state', 'region'])}</span>)}</div> : <p className="py-8 text-center text-sm text-slate-500">No service areas registered.</p>}</div></Inspector>
                <Panel title="Document Status"><DenseTable records={documents} columns={[
                    { label: 'Document', keys: ['name', 'documentType'] }, { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                    { label: 'Expiry', keys: ['expiryDate'], render: record => formatDate(field(record, ['expiryDate'])) },
                ]} /></Panel>
                <Panel title="Recent Activity"><DenseTable records={activity} columns={[
                    { label: 'Date', keys: ['createdAt', 'date'], render: record => formatDate(field(record, ['createdAt', 'date'])) }, { label: 'Activity', keys: ['title', 'action', 'description'] },
                ]} /></Panel>
            </div>
        </div>
    </div>
}
