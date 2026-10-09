'use client'

import Link from 'next/link'
import { Check, CircleAlert, ShieldCheck } from 'lucide-react'
import type { Application, StepState } from './api'

export const REVIEW_STEP = 'review'

/** The numbered progress strip above every application page. The last entry is always Review. */
export function Stepper({ application, current }: { application: Application; current: string }) {
    const entries = [
        ...application.steps.map(step => ({ key: step.key, label: step.shortTitle, done: step.state === 'COMPLETED' })),
        { key: REVIEW_STEP, label: 'Review & Submit', done: !application.editable },
    ]

    return (
        <nav aria-label="Application steps" className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            <ol className="flex min-w-max items-start md:min-w-0">
                {entries.map((entry, index) => {
                    const active = entry.key === current
                    return (
                        <li key={entry.key} className="relative flex flex-1 justify-center">
                            {index > 0 && (
                                <span
                                    aria-hidden
                                    className={`absolute top-4 h-0.5 ${entries[index - 1].done ? 'bg-[#1257e0]' : 'bg-[#d5dce6]'}`}
                                    style={{ left: 'calc(-50% + 22px)', right: 'calc(50% + 22px)' }}
                                />
                            )}
                            <Link
                                href={`/partner/qualification/${entry.key}`}
                                aria-current={active ? 'step' : undefined}
                                className="group relative flex w-[76px] flex-col items-center gap-1.5 rounded-lg px-1 py-0.5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1257e0] md:w-auto md:min-w-[96px]"
                            >
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-semibold ${
                                        active
                                            ? 'border-[#1257e0] bg-[#1257e0] text-white ring-4 ring-[#e8f0ff]'
                                            : entry.done
                                                ? 'border-[#1257e0] bg-white text-[#1257e0]'
                                                : 'border-[#c4ccd8] bg-white text-[#3b4a60] group-hover:border-slate-400'
                                    }`}
                                >
                                    {entry.done && !active ? <Check size={16} strokeWidth={3} aria-hidden /> : index + 1}
                                </span>
                                <span className={`text-[11.5px] leading-tight md:text-[13px] ${active ? 'font-semibold text-[#1257e0]' : 'text-[#26364d]'}`}>
                                    {entry.label}
                                    {entry.done && <span className="sr-only"> (complete)</span>}
                                </span>
                            </Link>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

export function StepStateChip({ state, active = false }: { state: StepState; active?: boolean }) {
    if (active && state !== 'COMPLETED') {
        return <span className="whitespace-nowrap rounded-md bg-[#e8f0ff] px-2 py-0.5 text-[11.5px] font-semibold text-[#1257e0]">In Progress</span>
    }
    const chip = {
        COMPLETED: ['bg-[#e4f6ec] text-[#0d7a3c]', 'Completed'],
        IN_PROGRESS: ['bg-[#fff3dc] text-[#a86400]', 'In Progress'],
        NOT_STARTED: ['bg-[#eef1f5] text-[#5b6b82]', 'Not Started'],
    }[state]
    return <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11.5px] font-semibold ${chip[0]}`}>{chip[1]}</span>
}

/** Right-hand column of the registration pages: overall progress, what this role may do, and what is still missing. */
export function RegistrationSidePanel({ application, current }: { application: Application; current: string }) {
    const currentIndex = application.steps.findIndex(step => step.key === current)
    const stepNumber = currentIndex < 0 ? application.steps.length + 1 : currentIndex + 1
    const percent = Math.round((application.sectionsCompleted / Math.max(1, application.sectionsTotal)) * 100)

    return (
        <aside className="space-y-3.5">
            <section className="rounded-[10px] border border-[#e3e8f0] bg-white p-4">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-[17px] font-bold text-[#0f1b2d]">Registration Progress</h2>
                    <p className="text-[13px] text-[#5b6b82]">Step {stepNumber} of {application.steps.length + 1}</p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                    <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                        aria-label="Sections completed"
                        className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e8edf5]"
                    >
                        <div className="h-full rounded-full bg-[#1257e0] transition-[width]" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-[13px] font-semibold text-[#26364d]">{percent}%</span>
                </div>
                <ol className="mt-3 space-y-0.5">
                    {application.steps.map((step, index) => {
                        const active = step.key === current
                        return (
                            <li key={step.key}>
                                <Link href={`/partner/qualification/${step.key}`} className="flex min-h-10 items-center gap-3 rounded-lg px-1 hover:bg-[#f5f8ff]">
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${active ? 'bg-[#1257e0] text-white' : step.state === 'COMPLETED' ? 'bg-[#e4f6ec] text-[#0d7a3c]' : 'bg-[#eef1f5] text-[#3b4a60]'}`}>
                                        {step.state === 'COMPLETED' && !active ? <Check size={14} strokeWidth={3} aria-hidden /> : index + 1}
                                    </span>
                                    <span className={`min-w-0 flex-1 truncate text-[13px] ${active ? 'font-semibold text-[#1257e0]' : 'text-[#26364d]'}`}>{step.title}</span>
                                    <StepStateChip state={step.state} active={active} />
                                </Link>
                            </li>
                        )
                    })}
                </ol>
            </section>

            <section className="rounded-[10px] border border-[#e3e8f0] bg-white p-4">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-[#0f1b2d]">
                    <ShieldCheck size={19} className="text-[#12a150]" aria-hidden /> Role Permissions
                </h2>
                <p className="mt-2.5 rounded-lg border border-[#c6ead4] bg-[#f0faf4] px-3 py-2.5 text-[12.5px] leading-5 text-[#26364d]">
                    As the vendor account holder you can complete registration, manage company details and submit for approval.
                    The buyer only sees your records after you submit.
                </p>
            </section>

            {application.editable && (
                <section className="rounded-[10px] border border-[#e3e8f0] bg-white p-4">
                    <h2 className="text-[16px] font-bold text-[#0f1b2d]">Next Actions</h2>
                    {application.missing.length === 0 ? (
                        <p className="mt-2 text-[13px] text-[#26364d]">Nothing is missing. Review your answers and submit.</p>
                    ) : (
                        <ul className="mt-2 space-y-1.5">
                            {application.missing.slice(0, 6).map((item, index) => (
                                <li key={item.fieldKey}>
                                    <Link href={`/partner/qualification/${item.stepKey}#field-${item.fieldKey}`} className="flex items-start gap-2.5 text-[13px] text-[#26364d] hover:text-[#1257e0]">
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${index === 0 ? 'bg-[#1257e0]' : 'bg-[#c4ccd8]'}`} aria-hidden />
                                        <span>{item.kind === 'DOCUMENT' ? 'Upload' : 'Complete'} {item.label} <span className="text-[#5b6b82]">· {item.stepTitle}</span></span>
                                    </Link>
                                </li>
                            ))}
                            {application.missing.length > 6 && (
                                <li className="flex items-center gap-2.5 text-[13px] text-[#5b6b82]">
                                    <CircleAlert size={14} aria-hidden /> and {application.missing.length - 6} more
                                </li>
                            )}
                        </ul>
                    )}
                </section>
            )}
        </aside>
    )
}
