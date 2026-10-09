"use client"

import { useEffect, useState } from 'react'
import { CheckCircle2, FileSearch, Link2, RefreshCw, Sparkles, Upload } from 'lucide-react'
import apiRequest from '@/lib/api'
import {
    DenseTable, field, Panel, PrimaryButton, RefreshButton, SectionSkeleton, ServiceNotice, StatusPill,
    useApiSources, WorkspaceHeader,
} from './RedesignKit'

const steps = ['Upload', 'Extract Requirements', 'Map Evidence', 'Draft Proposal', 'Review & Export']

export default function AiTenderWorkspace({ tenderId }: { tenderId: string }) {
    const { sources, loading, failed, refresh } = useApiSources([`/tenders/${tenderId}`, `/tenders/${tenderId}/requirements`, `/tenders/${tenderId}/proposal`])
    const [tenderRows, requirements, proposalRows] = sources
    const tender = tenderRows[0]
    const proposal = proposalRows[0]
    const [draft, setDraft] = useState('')
    const [saving, setSaving] = useState(false)
    const [generating, setGenerating] = useState(false)
    useEffect(() => { setDraft(String(field(proposal, ['content', 'draft'], ''))) }, [proposal])

    async function generate() {
        setGenerating(true)
        try { await apiRequest(`/tenders/${tenderId}/proposal/generate`, { method: 'POST', body: {} }); refresh() } finally { setGenerating(false) }
    }
    async function save() {
        setSaving(true)
        try { await apiRequest(`/tenders/${tenderId}/proposal`, { method: 'PUT', body: { content: draft } }); refresh() } finally { setSaving(false) }
    }
    if (loading) return <SectionSkeleton />
    const activeStep = Number(field(proposal, ['workflowStep'], field(tender, ['workflowStep'], 1)))
    return <div className="space-y-4">
        <WorkspaceHeader eyebrow="AI tendering" title="AI Tender Proposal Workspace" subtitle="Extract requirements, map evidence and draft a compliant proposal with source traceability." actions={<RefreshButton loading={loading} onClick={refresh} />} />
        <ServiceNotice failed={failed} />
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">{steps.map((step, index) => <div key={step} className="relative flex items-center gap-2 sm:flex-col sm:text-center"><span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index + 1 <= activeStep ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-500'}`}>{index + 1 < activeStep ? <CheckCircle2 size={15} /> : index + 1}</span><span className="text-xs font-semibold text-slate-700">{step}</span></div>)}</div>
        <div className="grid gap-4 2xl:grid-cols-[minmax(280px,0.8fr)_minmax(420px,1fr)_minmax(360px,0.9fr)]">
            <Panel title="1. Tender Document" subtitle={String(field(tender, ['fileName', 'documentName'], 'No document uploaded'))} action={<PrimaryButton><Upload size={15} /> Upload</PrimaryButton>}>
                {field(tender, ['documentUrl'], '') ? <iframe title="Tender document" src={String(field(tender, ['documentUrl']))} className="h-[620px] w-full bg-slate-50" /> : <div className="flex h-[620px] flex-col items-center justify-center bg-slate-50 px-8 text-center"><FileSearch size={40} className="text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-700">No tender document is available.</p><p className="mt-1 text-xs text-slate-500">Upload a secured tender document to begin extraction.</p></div>}
            </Panel>
            <Panel title={`2. Extracted Requirements (${requirements.length})`} subtitle="AI-extracted requirements remain subject to human review">
                <DenseTable records={requirements} columns={[
                    { label: 'Requirement', keys: ['text', 'requirement'] }, { label: 'Source', keys: ['sourcePage', 'source'] }, { label: 'Evidence', keys: ['evidenceCount'] },
                    { label: 'Confidence', keys: ['confidence'], render: record => `${field(record, ['confidence'], 0)}%` }, { label: 'Reviewer', keys: ['reviewerName'] },
                    { label: 'Status', keys: ['status'], render: record => <StatusPill value={field(record, ['status'])} /> },
                ]} />
            </Panel>
            <Panel title="3. Proposal Draft" subtitle="Generated text must be verified against source documents" action={<button onClick={generate} disabled={generating} className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 disabled:opacity-50"><RefreshCw size={14} className={generating ? 'animate-spin' : ''} />{generating ? 'Generating…' : 'Regenerate'}</button>}>
                <div className="p-4"><div className="mb-3 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-500"><Sparkles size={15} className="text-blue-600" />AI-assisted draft with evidence links</div><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Generate or enter proposal content…" className="h-[430px] w-full resize-none rounded-lg border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /><div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1 text-xs text-slate-500"><Link2 size={14} />{requirements.filter(item => Number(field(item, ['evidenceCount'], 0)) > 0).length} requirements have evidence</span><PrimaryButton onClick={save} disabled={!draft.trim() || saving}>{saving ? 'Saving…' : 'Save draft'}</PrimaryButton></div><div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Verify against source before submission.</strong> AI-generated content must be reviewed by an authorised user.</div></div>
            </Panel>
        </div>
    </div>
}
