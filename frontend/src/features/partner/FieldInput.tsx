'use client'

import { useRef, useState } from 'react'
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { fieldErrorsOf, messageOf, partnerApi, type Field } from './api'
import { usePartner } from './PartnerProvider'

const inputClass =
    'block w-full rounded-lg border border-[#d5dce6] bg-white px-3 py-2 text-[14px] text-[#0f1b2d] placeholder:text-slate-400 ' +
    'focus:border-[#1257e0] focus:outline-none focus:ring-2 focus:ring-[#1257e0]/25 disabled:bg-slate-100 disabled:text-slate-600'

interface FieldInputProps {
    field: Field
    value: string | string[]
    required: boolean
    disabled: boolean
    error?: string
    onChange: (value: string | string[]) => void
}

/** One answer of the application form, rendered from its server-side definition. */
export function FieldInput({ field, value, required, disabled, error, onChange }: FieldInputProps) {
    const id = `field-${field.key}`
    const describedBy = [field.hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
    const common = { id, disabled, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy } as const
    const text = typeof value === 'string' ? value : ''
    const isGroup = field.type === 'MULTI_SELECT' || field.type === 'YES_NO'

    let control
    switch (field.type) {
        case 'TEXTAREA':
            control = <textarea {...common} rows={3} value={text} onChange={event => onChange(event.target.value)} className={inputClass} />
            break
        case 'SELECT':
            control = (
                <select {...common} value={text} onChange={event => onChange(event.target.value)} className={inputClass}>
                    <option value="">Choose…</option>
                    {field.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            )
            break
        case 'MULTI_SELECT': {
            const chosen = Array.isArray(value) ? value : []
            control = (
                <div className="flex flex-wrap gap-2">
                    {field.options.map(option => {
                        const on = chosen.includes(option)
                        return (
                            <button
                                key={option}
                                type="button"
                                disabled={disabled}
                                aria-pressed={on}
                                onClick={() => onChange(on ? chosen.filter(item => item !== option) : [...chosen, option])}
                                className={`min-h-10 rounded-full border px-3.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1257e0] disabled:opacity-70 ${
                                    on ? 'border-[#1257e0] bg-[#e8f0ff] text-[#0f3fa8]' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                                }`}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>
            )
            break
        }
        case 'YES_NO':
            control = (
                <div className="flex gap-6">
                    {[['YES', 'Yes'], ['NO', 'No']].map(([optionValue, label]) => (
                        <label key={optionValue} className="flex min-h-10 items-center gap-2 text-[15px]">
                            <input
                                type="radio"
                                name={id}
                                value={optionValue}
                                checked={text === optionValue}
                                disabled={disabled}
                                onChange={() => onChange(optionValue)}
                                className="h-4 w-4 accent-[#1257e0]"
                            />
                            {label}
                        </label>
                    ))}
                </div>
            )
            break
        default:
            control = (
                <input
                    {...common}
                    type={field.type === 'DATE' ? 'date' : field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
                    inputMode={field.type === 'NUMBER' ? 'decimal' : undefined}
                    autoComplete={field.sensitive ? 'off' : undefined}
                    value={text}
                    placeholder={field.sensitive && field.maskedValue ? `${field.maskedValue} (saved, type to replace)` : undefined}
                    onChange={event => onChange(event.target.value)}
                    className={inputClass}
                />
            )
    }

    const label = (
        <>
            {field.label}
            {required ? <span className="text-red-600" aria-hidden> *</span> : <span className="font-normal text-slate-500"> (optional)</span>}
        </>
    )

    return (
        <div>
            {isGroup ? (
                <fieldset>
                    <legend className="mb-1.5 text-[13px] font-semibold text-[#0f1b2d]">{label}</legend>
                    {control}
                </fieldset>
            ) : (
                <>
                    <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[#0f1b2d]">{label}</label>
                    {control}
                </>
            )}
            {field.hint && <p id={`${id}-hint`} className="mt-1 text-[13px] text-slate-600">{field.hint}</p>}
            {error && <p id={`${id}-error`} role="alert" className="mt-1 text-[13px] font-medium text-red-700">{error}</p>}
        </div>
    )
}

/**
 * A document slot. Files are uploaded as soon as they are chosen, independently of the rest of
 * the form, so a large upload is never lost to an unsaved field elsewhere.
 */
export function DocumentInput({ field, required, disabled }: { field: Field; required: boolean; disabled: boolean }) {
    const { application, uploadDocument, removeDocument } = usePartner()
    const input = useRef<HTMLInputElement>(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const id = `field-${field.key}`
    const maxBytes = application?.maxDocumentBytes ?? 10 * 1024 * 1024

    async function run(action: () => Promise<unknown>) {
        setBusy(true)
        setError(null)
        try {
            await action()
        } catch (failure) {
            setError(fieldErrorsOf(failure)[field.key] ?? messageOf(failure))
        } finally {
            setBusy(false)
            if (input.current) input.current.value = ''
        }
    }

    function choose(file: File | undefined) {
        if (!file) return
        if (file.size > maxBytes) {
            setError(`That file is ${formatBytes(file.size)}. The limit is ${formatBytes(maxBytes)}.`)
            return
        }
        run(() => uploadDocument(field.key, file))
    }

    return (
        <div>
            <p className="mb-1.5 text-[13px] font-semibold text-[#0f1b2d]">
                {field.label}
                {required ? <span className="text-red-600" aria-hidden> *</span> : <span className="font-normal text-slate-500"> (optional)</span>}
            </p>
            {field.hint && <p className="mb-2 text-[13px] text-slate-600">{field.hint}</p>}

            {field.document ? (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <FileText size={20} className="shrink-0 text-[#1257e0]" aria-hidden />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{field.document.fileName}</p>
                        <p className="text-xs text-slate-600">{formatBytes(field.document.sizeBytes)} · uploaded {formatDate(field.document.uploadedAt)}</p>
                    </div>
                    <a
                        href={partnerApi.documentUrl(field.key)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
                    >
                        <Download size={15} aria-hidden /> View
                    </a>
                    {!disabled && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => run(() => removeDocument(field.key))}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                            <Trash2 size={15} aria-hidden /> Remove
                        </button>
                    )}
                </div>
            ) : (
                disabled && <p className="text-sm text-slate-600">No file was provided.</p>
            )}

            {!disabled && (
                <div className={field.document ? 'mt-2' : ''}>
                    <label
                        htmlFor={id}
                        className={`flex min-h-12 cursor-pointer flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-lg border border-dashed px-3 py-3 text-center text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-[#1257e0] ${
                            busy ? 'border-slate-300 bg-slate-100 text-slate-500' : 'border-[#1257e0]/60 bg-white text-[#0f4bc4] hover:bg-[#e8f0ff]'
                        }`}
                    >
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <Upload size={17} aria-hidden />
                            {busy ? 'Working…' : field.document ? 'Replace file' : 'Choose a file'}
                        </span>
                        <span className="w-full font-normal text-slate-600 sm:w-auto">PDF, JPG or PNG, up to {formatBytes(maxBytes)}</span>
                        <input
                            ref={input}
                            id={id}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                            disabled={busy}
                            onChange={event => choose(event.target.files?.[0])}
                            className="sr-only"
                        />
                    </label>
                </div>
            )}
            {error && <p role="alert" className="mt-1 text-[13px] font-medium text-red-700">{error}</p>}
        </div>
    )
}

export function formatBytes(bytes: number): string {
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
