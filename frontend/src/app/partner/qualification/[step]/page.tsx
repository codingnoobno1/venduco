'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, CircleCheck, Lock, Save } from 'lucide-react'
import { usePartner } from '@/features/partner/PartnerProvider'
import { Notice } from '@/features/partner/PartnerShell'
import { RegistrationSidePanel, REVIEW_STEP, Stepper } from '@/features/partner/Stepper'
import { DocumentInput, FieldInput, formatDate } from '@/features/partner/FieldInput'
import { fieldErrorsOf, messageOf, type Application, type Field, type Step, type StepValues } from '@/features/partner/api'

export default function QualificationStepPage() {
    const { step: stepKey } = useParams<{ step: string }>()
    const { application } = usePartner()
    if (!application) return null

    if (stepKey === REVIEW_STEP) return <ReviewStep application={application} />

    const index = application.steps.findIndex(step => step.key === stepKey)
    if (index < 0) {
        return (
            <Notice tone="error" title="That section does not exist">
                <Link href="/partner" className="font-semibold underline">Back to home</Link>
            </Notice>
        )
    }
    // Keyed by step so each section starts from its own saved answers.
    return <StepForm key={stepKey} application={application} step={application.steps[index]} index={index} />
}

function initialValues(step: Step): StepValues {
    const values: StepValues = {}
    step.fields.filter(field => field.type !== 'DOCUMENT').forEach(field => {
        // A sensitive answer is never sent back, so its box starts empty; leaving it empty keeps what is saved.
        values[field.key] = field.sensitive ? '' : field.value ?? (field.type === 'MULTI_SELECT' ? [] : '')
    })
    return values
}

function StepForm({ application, step, index }: { application: Application; step: Step; index: number }) {
    const router = useRouter()
    const { saveStep } = usePartner()
    const [values, setValues] = useState<StepValues>(() => initialValues(step))
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [saving, setSaving] = useState<'draft' | 'continue' | null>(null)
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const [dirty, setDirty] = useState(false)

    const locked = !application.editable
    const nextKey = application.steps[index + 1]?.key ?? REVIEW_STEP
    const nextTitle = application.steps[index + 1]?.shortTitle ?? 'Review'
    // Long answers and uploads take the full row; short answers sit two to a row on wide screens.
    const isWide = (field: Field) => field.type === 'TEXTAREA' || field.type === 'DOCUMENT' || field.type === 'MULTI_SELECT'

    // Answers across the whole application, with this form's unsaved edits on top, so a field that
    // depends on another ("GSTIN if GST applies") reacts as soon as the other is answered.
    const answers = useMemo(() => {
        const all: Record<string, unknown> = {}
        application.steps.forEach(s => s.fields.forEach(field => { all[field.key] = field.value }))
        return { ...all, ...values }
    }, [application, values])

    const applies = (field: Field) => !field.requiredWhen || answers[field.requiredWhen.field] === field.requiredWhen.equals
    const isRequired = (field: Field) => field.requiredWhen ? applies(field) : field.required

    // Leaving with unsaved answers would lose them silently; the browser asks first.
    useEffect(() => {
        if (!dirty) return
        const warn = (event: BeforeUnloadEvent) => event.preventDefault()
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [dirty])

    function change(key: string, value: string | string[]) {
        setValues(current => ({ ...current, [key]: value }))
        setErrors(current => (current[key] ? { ...current, [key]: '' } : current))
        setDirty(true)
    }

    async function save(then: 'draft' | 'continue') {
        setSaving(then)
        setFormError(null)
        try {
            await saveStep(step.key, values)
            setErrors({})
            setDirty(false)
            setSavedAt(new Date().toISOString())
            if (then === 'continue') router.push(`/partner/qualification/${nextKey}`)
        } catch (failure) {
            const fieldErrors = fieldErrorsOf(failure)
            setErrors(fieldErrors)
            const firstInvalid = Object.keys(fieldErrors)[0]
            setFormError(firstInvalid ? 'Some answers need attention. Nothing on this page was saved.' : messageOf(failure))
            if (firstInvalid) document.getElementById(`field-${firstInvalid}`)?.focus()
        } finally {
            setSaving(null)
        }
    }

    return (
        <div className="space-y-4">
            <RegistrationHeader application={application} />

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                <div className="min-w-0 space-y-4">
                    <Stepper application={application} current={step.key} />

                    {locked && (
                        <Notice tone="info" title={application.status === 'SUBMITTED' ? 'Under review' : 'This application is closed'}>
                            <p className="flex items-center gap-1.5"><Lock size={14} aria-hidden /> Your answers are shown as submitted and cannot be changed.</p>
                        </Notice>
                    )}
                    {application.status === 'CORRECTION_REQUIRED' && application.reviewNote && (
                        <Notice tone="warn" title="The reviewer asked for a correction"><p>{application.reviewNote}</p></Notice>
                    )}
                    {formError && <Notice tone="error" title={formError} />}

                    <form
                        noValidate
                        onSubmit={event => { event.preventDefault(); save('continue') }}
                        className="rounded-[10px] border border-[#e3e8f0] bg-white"
                    >
                        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e3e8f0] px-4 py-3 sm:px-5">
                            <div>
                                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">{step.title}</h2>
                                {step.intro && <p className="mt-0.5 text-[13px] text-[#5b6b82]">{step.intro}</p>}
                            </div>
                            <p className="text-[12.5px] font-medium text-[#e02424]">* Mandatory fields</p>
                        </div>

                        <div className="grid gap-x-6 gap-y-4 p-4 sm:p-5 lg:grid-cols-2">
                        {step.fields.filter(applies).map(field =>
                            <div key={field.key} className={isWide(field) ? 'lg:col-span-2' : ''}>
                            {field.type === 'DOCUMENT' ? (
                                <DocumentInput field={field} required={isRequired(field)} disabled={locked} />
                            ) : (
                                <FieldInput
                                    field={field}
                                    value={values[field.key] ?? ''}
                                    required={isRequired(field) && !(field.sensitive && field.maskedValue)}
                                    disabled={locked}
                                    error={errors[field.key] || undefined}
                                    onChange={value => change(field.key, value)}
                                />
                            )}
                            </div>
                        )}
                        </div>

                        {!locked && (
                            <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] flex items-center gap-3 rounded-b-[10px] border-t border-[#e3e8f0] bg-white px-4 py-3 sm:px-5 md:static">
                                <p className="order-first min-w-0 flex-1 text-xs leading-tight text-[#5b6b82]" aria-live="polite">
                                    {dirty ? 'Not saved yet' : savedAt ? <span className="inline-flex items-center gap-1 text-emerald-800"><CircleCheck size={13} aria-hidden /> Saved</span> : application.lastSavedAt ? <span className="hidden sm:inline">Last saved {formatDate(application.lastSavedAt)}</span> : null}
                                </p>
                                <button
                                    type="button"
                                    disabled={saving !== null}
                                    onClick={() => save('draft')}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#1257e0] bg-white px-4 text-sm font-semibold text-[#1257e0] hover:bg-[#e8f0ff] disabled:opacity-60"
                                >
                                    <Save size={16} aria-hidden /> {saving === 'draft' ? 'Saving…' : 'Save as Draft'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving !== null}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1257e0] px-5 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 hover:bg-[#0f4bc4] disabled:opacity-60"
                                >
                                    {saving === 'continue' ? 'Saving…' : <><span className="sm:hidden">Continue</span><span className="hidden sm:inline">Continue to {nextTitle}</span></>} <ArrowRight size={16} aria-hidden />
                                </button>
                            </div>
                        )}
                    </form>

                    {locked && (
                        <Link href={`/partner/qualification/${nextKey}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                            Next section <ArrowRight size={16} aria-hidden />
                        </Link>
                    )}
                </div>
                <RegistrationSidePanel application={application} current={step.key} />
            </div>
        </div>
    )
}

/** Page title shared by every registration step, as on the vendor registration screens. */
function RegistrationHeader({ application }: { application: Application }) {
    return (
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5b6b82]">Supplier registration</p>
                <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-[#0f1b2d] sm:text-[30px]">Vendor Registration</h1>
                <p className="text-[14px] text-[#5b6b82] sm:text-[15px]">Complete each registration section for {application.applicant} to onboard as a verified vendor.</p>
            </div>
            {application.lastSavedAt && <p className="text-[12.5px] text-[#5b6b82]">Last saved {formatDate(application.lastSavedAt)}</p>}
        </header>
    )
}

function ReviewStep({ application }: { application: Application }) {
    const { submit } = usePartner()
    const [declaredAccurate, setDeclaredAccurate] = useState(false)
    const [consentToShare, setConsentToShare] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function send() {
        setSubmitting(true)
        setError(null)
        try {
            await submit(declaredAccurate, consentToShare)
        } catch (failure) {
            setError(messageOf(failure))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <RegistrationHeader application={application} />

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                <div className="min-w-0 space-y-4">
                    <Stepper application={application} current={REVIEW_STEP} />

                    <header>
                        <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">Review &amp; Submit</h2>
                        <p className="text-[13px] text-[#5b6b82]">{application.applicant} · version {application.version}</p>
                    </header>

                    {application.status === 'SUBMITTED' && (
                        <Notice tone="success" title="Submitted for review">
                            <p>Sent {application.submittedAt ? formatDate(application.submittedAt) : ''}. You will be told when a decision is made.</p>
                        </Notice>
                    )}
                    {application.status === 'APPROVED' && <Notice tone="success" title="Qualification approved" />}
                    {application.status === 'REJECTED' && <Notice tone="error" title="Not approved">{application.reviewNote && <p>{application.reviewNote}</p>}</Notice>}
                    {application.status === 'CORRECTION_REQUIRED' && application.reviewNote && (
                        <Notice tone="warn" title="The reviewer asked for a correction"><p>{application.reviewNote}</p></Notice>
                    )}

                    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                        <ul className="divide-y divide-slate-100">
                            {application.steps.map((step, index) => (
                                <li key={step.key}>
                                    <Link href={`/partner/qualification/${step.key}`} className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-slate-50">
                                        <CircleCheck size={20} className={step.state === 'COMPLETED' ? 'text-green-600' : 'text-slate-300'} aria-hidden />
                                        <span className="flex-1 text-sm font-semibold text-slate-900">{index + 1}. {step.title}</span>
                                        <span className={`text-xs font-semibold ${step.state === 'COMPLETED' ? 'text-emerald-800' : 'text-amber-800'}`}>
                                            {step.state === 'COMPLETED' ? 'Completed' : 'Incomplete'}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {application.editable && (
                        <>
                            {application.missing.length > 0 ? (
                                <Notice tone="warn" title={`${application.missing.length} required item${application.missing.length === 1 ? ' is' : 's are'} still missing`}>
                                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                        {application.missing.slice(0, 8).map(item => (
                                            <li key={item.fieldKey}>
                                                <Link href={`/partner/qualification/${item.stepKey}#field-${item.fieldKey}`} className="underline">{item.label}</Link>
                                                <span className="text-amber-900/80"> in {item.stepTitle}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Notice>
                            ) : (
                                <Notice tone="success" title={`${application.sectionsCompleted} of ${application.sectionsTotal} sections completed`}>
                                    <p>You can now submit your qualification for review.</p>
                                </Notice>
                            )}

                            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" checked={declaredAccurate} onChange={event => setDeclaredAccurate(event.target.checked)} className="mt-1 h-4 w-4 accent-[#1257e0]" />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-900">I declare that the information provided is accurate</span>
                                        <span className="block text-[13px] text-slate-600">All information and documents submitted are true, correct and complete to the best of my knowledge.</span>
                                    </span>
                                </label>
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" checked={consentToShare} onChange={event => setConsentToShare(event.target.checked)} className="mt-1 h-4 w-4 accent-[#1257e0]" />
                                    <span>
                                        <span className="block text-sm font-semibold text-slate-900">I consent to my documents being shared with the buyer</span>
                                        <span className="block text-[13px] text-slate-600">My qualification information and supporting documents may be shared for pre-qualification and tendering.</span>
                                    </span>
                                </label>
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-900">
                                    <strong>Submission does not guarantee approval.</strong> Meeting the requirements does not guarantee an invitation to bid on any tender.
                                </p>
                            </section>

                            {error && <Notice tone="error" title={error} />}

                            <button
                                type="button"
                                onClick={send}
                                disabled={submitting || !application.canSubmit || !declaredAccurate || !consentToShare}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1257e0] px-4 text-[15px] font-bold text-white hover:bg-[#0f4bc4] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                            >
                                {submitting ? 'Submitting…' : 'Submit for review'}
                            </button>
                            {(!application.canSubmit || !declaredAccurate || !consentToShare) && (
                                <p className="text-center text-[13px] text-slate-600">
                                    {!application.canSubmit ? 'Complete the missing items above to submit.' : 'Accept both declarations to submit.'}
                                </p>
                            )}
                        </>
                    )}
                </div>
                <RegistrationSidePanel application={application} current={REVIEW_STEP} />
            </div>
        </div>
    )
}
