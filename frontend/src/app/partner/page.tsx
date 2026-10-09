'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ChevronRight, CircleAlert, CircleCheck, Clock, FileText, Hourglass, PencilLine, ShieldCheck, TriangleAlert, Upload } from 'lucide-react'
import { usePartner } from '@/features/partner/PartnerProvider'
import { formatDate } from '@/features/partner/FieldInput'
import { REVIEW_STEP, StepStateChip } from '@/features/partner/Stepper'
import type { Application } from '@/features/partner/api'

const MISSING_SHOWN = 6

const STATUS_TEXT: Record<Application['status'], { title: string; tone: 'red' | 'amber' | 'blue' | 'green'; text: (application: Application) => string }> = {
    DRAFT: { title: 'Not eligible yet', tone: 'red', text: () => 'Complete all required sections and submit for buyer review.' },
    CORRECTION_REQUIRED: { title: 'Correction required', tone: 'amber', text: application => application.reviewNote ?? 'The reviewer asked for a change. Update your answers and submit again.' },
    SUBMITTED: { title: 'In Review', tone: 'blue', text: application => `Submitted ${application.submittedAt ? formatDate(application.submittedAt) : ''}. Nothing can be changed meanwhile.` },
    APPROVED: { title: 'Approved', tone: 'green', text: () => 'Your qualification has been approved.' },
    REJECTED: { title: 'Not approved', tone: 'red', text: application => application.reviewNote ?? 'Your application was not approved.' },
}

const TONES = {
    red: { tile: 'bg-[#fde8e8] text-[#e02424]', text: 'text-[#c81e1e]' },
    amber: { tile: 'bg-[#fff3dc] text-[#e08a00]', text: 'text-[#a86400]' },
    blue: { tile: 'bg-[#e8f0ff] text-[#1257e0]', text: 'text-[#1257e0]' },
    green: { tile: 'bg-[#e4f6ec] text-[#12a150]', text: 'text-[#0d7a3c]' },
}

/** Qualification home: where the application stands and what to do next. */
export default function PartnerHomePage() {
    const { application } = usePartner()
    if (!application) return null

    const nextStep = application.steps.find(step => step.state !== 'COMPLETED')?.key ?? REVIEW_STEP
    const progress = Math.round((application.sectionsCompleted / Math.max(1, application.sectionsTotal)) * 100)
    const started = application.sectionsCompleted > 0 || application.steps.some(step => step.state === 'IN_PROGRESS')
    const status = STATUS_TEXT[application.status]
    const initials = application.applicant.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()

    return (
        <div className="space-y-3.5">
            <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5b6b82]">Partner qualification</p>
                    <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-[#0f1b2d] sm:text-[30px]">Vendor Onboarding</h1>
                    <p className="text-[14px] text-[#5b6b82] sm:text-[15px]">Track your registration, missing evidence and buyer review in one place.</p>
                </div>
                {application.lastSavedAt && (
                    <p className="text-[12.5px] text-[#5b6b82]">Last updated<br className="hidden sm:block" /> <span className="text-[#26364d]">{formatDate(application.lastSavedAt)}</span></p>
                )}
            </header>

            <section className="flex items-center gap-4 rounded-[10px] border border-[#e3e8f0] bg-white p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-lg font-bold text-[#1257e0]">{initials}</span>
                <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-[20px] font-bold tracking-[-0.01em] text-[#0f1b2d]">
                        <span className="truncate">{application.applicant}</span>
                        {application.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e4f6ec] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#0d7a3c]"><CircleCheck size={13} aria-hidden /> Qualified</span>
                        )}
                    </h2>
                    <p className="text-[13px] text-[#5b6b82]">Application version {application.version}</p>
                </div>
            </section>

            <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-[10px] border border-[#e3e8f0] bg-white px-5 py-4">
                    <div className="flex items-start gap-4">
                        <Tile icon={FileText} tone="blue" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-[#26364d]">Onboarding Progress</p>
                            <p className="mt-0.5 text-[26px] font-extrabold leading-tight text-[#0f1b2d]">{application.sectionsCompleted} / {application.sectionsTotal}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <div
                                    role="progressbar"
                                    aria-valuemin={0}
                                    aria-valuemax={application.sectionsTotal}
                                    aria-valuenow={application.sectionsCompleted}
                                    aria-label="Sections completed"
                                    className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8edf5]"
                                >
                                    <div className="h-full rounded-full bg-[#1257e0] transition-[width]" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-[12px] font-semibold text-[#26364d]">{progress}%</span>
                            </div>
                        </div>
                    </div>
                </article>
                <Kpi icon={TriangleAlert} tone={application.missing.length ? 'red' : 'green'} label="Missing Evidence" value={String(application.missing.length)} detail={application.missing.length ? 'items require attention' : 'nothing outstanding'} />
                <Kpi icon={Hourglass} tone="amber" label="Buyer Review Status" value={application.status === 'SUBMITTED' ? 'In Review' : application.status === 'DRAFT' ? 'Not submitted' : status.title} detail={application.submittedAt ? `Since ${formatDate(application.submittedAt)}` : 'Submit when every section is complete'} />
                <Kpi icon={status.tone === 'green' ? ShieldCheck : status.tone === 'red' ? CircleAlert : Clock} tone={status.tone} label="Eligibility (Current)" value={status.title} detail={status.text(application)} />
            </section>

            <section className="grid items-start gap-3.5 xl:grid-cols-[minmax(0,1fr)_400px]">
                <article className="overflow-hidden rounded-[10px] border border-[#e3e8f0] bg-white">
                    <h2 className="px-4 pb-2 pt-3.5 text-[18px] font-bold tracking-[-0.01em] text-[#0f1b2d]">Onboarding Sections</h2>
                    <div className="overflow-x-auto">
                        <table className="vc-table min-w-[560px]">
                            <thead>
                                <tr>
                                    <th className="w-14 pl-4">Step</th>
                                    <th>Section</th>
                                    <th>Status</th>
                                    <th className="w-32 pr-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {application.steps.map((step, index) => {
                                    const needsWork = application.editable && step.state !== 'COMPLETED'
                                    return (
                                        <tr key={step.key}>
                                            <td className="pl-4">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f0ff] text-[12px] font-semibold text-[#1257e0]">{index + 1}</span>
                                            </td>
                                            <td>
                                                <p className="text-[13.5px] font-semibold text-[#0f1b2d]">{step.title}</p>
                                                {step.intro && <p className="max-w-md truncate text-[12px] text-[#5b6b82]">{step.intro}</p>}
                                            </td>
                                            <td><StepStateChip state={step.state} /></td>
                                            <td className="pr-4 text-right">
                                                <Link
                                                    href={`/partner/qualification/${step.key}`}
                                                    className={`inline-flex h-8 items-center gap-1 rounded-lg border px-3 text-[12.5px] font-semibold ${needsWork ? 'border-[#1257e0] text-[#1257e0] hover:bg-[#e8f0ff]' : 'border-[#e3e8f0] text-[#1257e0] hover:bg-[#f5f8ff]'}`}
                                                >
                                                    {needsWork ? 'Resume' : 'View'} <ChevronRight size={14} aria-hidden />
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </article>

                <aside className="space-y-3.5">
                    {application.editable && (
                        <section className="rounded-[10px] border border-[#e3e8f0] bg-white" aria-labelledby="missing-heading">
                            <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5">
                                <h2 id="missing-heading" className="flex items-center gap-2 text-[17px] font-bold text-[#0f1b2d]">
                                    Required for Buyer Approval
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${application.missing.length ? 'bg-[#e02424]' : 'bg-[#12a150]'}`}>{application.missing.length}</span>
                                </h2>
                            </div>
                            {application.missing.length === 0 ? (
                                <p className="px-4 pb-3 text-[13px] text-[#26364d]">Nothing is missing. Review your answers and submit.</p>
                            ) : (
                                <ul className="divide-y divide-[#edf1f6]">
                                    {application.missing.slice(0, MISSING_SHOWN).map(item => (
                                        <li key={item.fieldKey}>
                                            <Link href={`/partner/qualification/${item.stepKey}#field-${item.fieldKey}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f5f8ff]">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fde8e8] text-[#e02424]">
                                                    {item.kind === 'DOCUMENT' ? <FileText size={19} aria-hidden /> : <PencilLine size={19} aria-hidden />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-[13.5px] font-semibold text-[#0f1b2d]">{item.label}</span>
                                                    <span className="block truncate text-[12px] text-[#5b6b82]">{item.stepTitle}</span>
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#fde8e8] px-2 py-0.5 text-[11.5px] font-semibold text-[#c81e1e]">
                                                    <CircleAlert size={12} aria-hidden /> Missing
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {application.missing.length > MISSING_SHOWN && (
                                <p className="px-4 pt-1 text-[12.5px] text-[#5b6b82]">and {application.missing.length - MISSING_SHOWN} more.</p>
                            )}
                            <div className="p-3">
                                <Link
                                    href={`/partner/qualification/${nextStep}`}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1257e0] text-sm font-semibold text-white shadow-sm shadow-blue-700/20 hover:bg-[#0f4bc4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1257e0]"
                                >
                                    <Upload size={17} aria-hidden />
                                    {nextStep === REVIEW_STEP ? 'Review and submit' : started ? 'Resume Onboarding' : 'Start Onboarding'}
                                    <ArrowRight size={17} aria-hidden />
                                </Link>
                            </div>
                        </section>
                    )}

                    {!application.editable && (
                        <Link href={`/partner/qualification/${REVIEW_STEP}`} className="flex min-h-12 items-center justify-center rounded-[10px] border border-[#e3e8f0] bg-white px-4 text-sm font-semibold text-[#1257e0] hover:bg-[#f5f8ff]">
                            View what you submitted
                        </Link>
                    )}

                    <section className={`rounded-[10px] border px-4 py-3 ${status.tone === 'green' ? 'border-[#c6ead4] bg-[#f0faf4]' : status.tone === 'blue' ? 'border-[#cfe0ff] bg-[#f3f7ff]' : status.tone === 'amber' ? 'border-[#f3dfa8] bg-[#fff8e6]' : 'border-[#f8c9c9] bg-[#fff5f5]'}`} role="status">
                        <p className={`text-[14px] font-bold ${TONES[status.tone].text}`}>{status.title}</p>
                        <p className="mt-0.5 text-[13px] text-[#26364d]">{status.text(application)}</p>
                    </section>
                </aside>
            </section>
        </div>
    )
}

function Tile({ icon: Icon, tone }: { icon: LucideIcon; tone: keyof typeof TONES }) {
    return (
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone].tile}`}>
            <Icon size={24} strokeWidth={1.8} aria-hidden />
        </span>
    )
}

function Kpi({ icon, tone, label, value, detail }: { icon: LucideIcon; tone: keyof typeof TONES; label: string; value: string; detail: string }) {
    return (
        <article className="rounded-[10px] border border-[#e3e8f0] bg-white px-5 py-4">
            <div className="flex items-start gap-4">
                <Tile icon={icon} tone={tone} />
                <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#26364d]">{label}</p>
                    <p className="mt-0.5 truncate text-[24px] font-extrabold leading-tight text-[#0f1b2d]">{value}</p>
                    <p className="mt-1 line-clamp-2 text-[12.5px] text-[#5b6b82]">{detail}</p>
                </div>
            </div>
        </article>
    )
}
