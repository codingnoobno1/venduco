'use client'

import Link from 'next/link'
import { Download, Upload } from 'lucide-react'
import { usePartner } from '@/features/partner/PartnerProvider'
import { formatBytes, formatDate } from '@/features/partner/FieldInput'
import { partnerApi, type Field, type Step } from '@/features/partner/api'

/** Document centre: every document the application asks for, in one place. */
export default function PartnerDocumentsPage() {
    const { application } = usePartner()
    if (!application) return null

    // What each conditional document depends on, read from the saved answers.
    const answers: Record<string, unknown> = {}
    application.steps.forEach(step => step.fields.forEach(field => { answers[field.key] = field.value }))

    const rows = application.steps.flatMap(step =>
        step.fields.filter(field => field.type === 'DOCUMENT').map(field => ({
            step,
            field,
            applies: !field.requiredWhen || answers[field.requiredWhen.field] === field.requiredWhen.equals,
        }))
    )
    const uploaded = rows.filter(row => row.field.document).length
    const missing = rows.filter(row => row.field.required && !row.field.document).length

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-xl font-bold tracking-tight text-slate-950">Document centre</h1>
                <p className="text-sm text-slate-600">
                    {uploaded} uploaded{missing > 0 ? `, ${missing} still required` : ''}. Documents are reviewed with your application.
                </p>
            </header>

            <ul className="space-y-3">
                {rows.map(({ step, field, applies }) => (
                    <DocumentRow key={field.key} step={step} field={field} applies={applies} editable={application.editable} />
                ))}
            </ul>
        </div>
    )
}

function DocumentRow({ step, field, applies, editable }: { step: Step; field: Field; applies: boolean; editable: boolean }) {
    const status = field.document
        ? ['bg-emerald-50 text-emerald-800', 'Uploaded']
        : field.required
            ? ['bg-red-50 text-red-800', 'Missing']
            : applies
                ? ['bg-slate-100 text-slate-700', 'Optional']
                : ['bg-slate-100 text-slate-700', 'Not needed']

    return (
        <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{field.label}</p>
                    <p className="text-xs text-slate-600">{step.title}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${status[0]}`}>{status[1]}</span>
            </div>

            {field.document ? (
                <p className="mt-2 truncate text-sm text-slate-800">
                    {field.document.fileName}
                    <span className="text-slate-600"> · {formatBytes(field.document.sizeBytes)} · {formatDate(field.document.uploadedAt)}</span>
                </p>
            ) : (
                !applies && <p className="mt-2 text-sm text-slate-600">Only needed if your answers in {step.title} call for it.</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                {field.document && (
                    <a href={partnerApi.documentUrl(field.key)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                        <Download size={15} aria-hidden /> View
                    </a>
                )}
                {editable && (
                    <Link
                        href={`/partner/qualification/${step.key}#field-${field.key}`}
                        className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${
                            field.document ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : 'bg-[#1257e0] text-white hover:bg-[#0f4bc4]'
                        }`}
                    >
                        <Upload size={15} aria-hidden /> {field.document ? 'Replace' : 'Upload'}
                    </Link>
                )}
            </div>
        </li>
    )
}
