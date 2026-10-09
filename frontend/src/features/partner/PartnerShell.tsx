'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Bell, Building2, ClipboardList, FileText, Gavel, House, LogOut, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePartner } from './PartnerProvider'

const NAV: Array<{ href: string; label: string; icon: LucideIcon; match: (path: string) => boolean }> = [
    { href: '/partner', label: 'Dashboard', icon: House, match: path => path === '/partner' },
    { href: '/partner/qualification', label: 'Registration', icon: ClipboardList, match: path => path.startsWith('/partner/qualification') },
    { href: '/partner/tenders', label: 'Tenders', icon: Gavel, match: path => path.startsWith('/partner/tenders') },
    { href: '/partner/documents', label: 'Documents', icon: FileText, match: path => path.startsWith('/partner/documents') },
]

function initialsOf(name: string | undefined) {
    return name?.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'
}

/**
 * Frame of the partner portal. On a phone: a navy top bar and a bottom tab bar, as in the mobile
 * designs. On a tablet the tabs become a narrow left rail, and on a desktop the full navy sidebar
 * and context bar of the workspace designs.
 */
export function PartnerShell({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { account, loading, loadError, reload } = usePartner()

    return (
        <div className="min-h-screen bg-[#f3f6fb] text-[#0f1b2d]">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 bg-[#0b1a33] px-4 text-white shadow-sm md:h-16 md:border-b md:border-[#e3e8f0] md:bg-white md:pl-[104px] md:text-[#0f1b2d] md:shadow-none lg:pl-[264px]">
                <Link href="/partner" className="flex items-baseline gap-2 md:hidden">
                    <span className="text-lg font-extrabold tracking-tight">Vendor<span className="text-[#3d8bff]">Connect</span></span>
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 sm:inline">Partner portal</span>
                </Link>

                <div className="hidden min-w-0 items-center gap-3 md:flex">
                    <div className="flex h-[44px] w-[260px] items-center gap-3 rounded-lg border border-[#e3e8f0] px-3">
                        <Building2 size={19} strokeWidth={1.7} className="shrink-0 text-slate-600" />
                        <span className="min-w-0 flex-1">
                            <span className="block text-[11px] leading-[14px] text-[#5b6b82]">Company</span>
                            <span className="block truncate text-[13px] font-semibold leading-[17px]">{account?.company ?? 'Your company'}</span>
                        </span>
                    </div>
                    <div className="hidden h-[44px] w-[210px] items-center gap-3 rounded-lg bg-[#f4f7fc] px-3 xl:flex">
                        <UserRound size={19} strokeWidth={1.7} className="shrink-0 text-slate-600" />
                        <span className="min-w-0 flex-1">
                            <span className="block text-[11px] leading-[14px] text-[#5b6b82]">Role</span>
                            <span className="block truncate text-[13px] font-semibold leading-[17px] capitalize">{user?.role ? user.role.toLowerCase().replace(/_/g, ' ') : 'Vendor'}</span>
                        </span>
                    </div>
                    <p className="hidden truncate border-l border-[#e3e8f0] pl-3 text-[11px] uppercase tracking-[0.04em] text-[#5b6b82] 2xl:block">
                        Vendor portal · Supplier registration
                    </p>
                </div>

                <div className="flex min-w-0 items-center gap-2 md:gap-3">
                    <span aria-hidden className="relative hidden h-9 w-9 items-center justify-center rounded-lg md:flex">
                        <Bell size={20} />
                    </span>
                    <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1257e0] text-xs font-bold text-white md:flex">
                        {initialsOf(user?.fullName)}
                    </span>
                    <span className="hidden min-w-0 max-w-40 truncate text-sm font-semibold text-slate-200 sm:block md:text-[#0f1b2d]">{user?.fullName}</span>
                    <button
                        onClick={logout}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 md:text-[#5b6b82] md:hover:bg-slate-100 md:hover:text-red-600"
                    >
                        <LogOut size={16} aria-hidden /> <span className="md:sr-only">Sign out</span>
                    </button>
                </div>
            </header>

            <nav
                aria-label="Partner portal"
                className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-[#0b1a33] pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:z-40 md:w-[88px] md:flex-col md:border-r-0 md:border-t-0 md:bg-gradient-to-b md:from-[#0b1a33] md:to-[#0a1630] md:pb-0 lg:w-[248px]"
            >
                <Link href="/partner" className="hidden h-16 shrink-0 items-center justify-center border-b border-white/10 text-[21px] font-extrabold tracking-[-0.02em] text-white md:flex lg:justify-start lg:px-6">
                    <span className="lg:hidden">V<span className="text-[#3d8bff]">C</span></span>
                    <span className="hidden lg:inline">Vendor<span className="text-[#3d8bff]">Connect</span></span>
                </Link>
                <div className="flex flex-1 md:flex-none md:flex-col md:gap-1 md:px-2 md:pt-3 lg:px-3">
                    {NAV.map(item => {
                        const active = item.match(pathname)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium md:flex-none md:rounded-lg md:py-3 lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-0 lg:text-[14px] lg:font-semibold ${active ? 'bg-white/10 text-white md:bg-gradient-to-r md:from-[#1257e0] md:to-[#0f3fa8] md:shadow-md md:shadow-blue-950/30' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}
                            >
                                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 md:max-w-none md:pb-12 md:pl-[108px] md:pr-6 lg:pl-[272px]">
                <div className="mx-auto w-full max-w-[1480px]">
                    {loading && <LoadingBlock />}
                    {!loading && loadError && (
                        <Notice tone="error" title="We could not load your details">
                            <p>{loadError}</p>
                            <button onClick={reload} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50">
                                Try again
                            </button>
                        </Notice>
                    )}
                    {!loading && !loadError && account && !account.canUsePlatform && (
                        <Notice tone="warn" title="Your account is not open yet">
                            <p>{account.blockedReason}</p>
                            {account.amountDue && (
                                <p className="mt-1">
                                    Amount due: {formatMoney(account.amountDue)}{account.plan ? ` for the ${account.plan} plan` : ''}.
                                </p>
                            )}
                            <p className="mt-2 text-amber-900/80">You can sign in again later to check; nothing else is needed from you here.</p>
                        </Notice>
                    )}
                    {!loading && !loadError && account?.canUsePlatform && children}
                </div>
            </main>
        </div>
    )
}

export function Notice({ tone, title, children }: { tone: 'error' | 'warn' | 'success' | 'info'; title: string; children?: ReactNode }) {
    const styles = {
        error: 'border-red-200 bg-red-50 text-red-900',
        warn: 'border-amber-200 bg-amber-50 text-amber-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
        info: 'border-sky-200 bg-sky-50 text-sky-900',
    }[tone]
    return (
        <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-[10px] border px-4 py-3 text-sm ${styles}`}>
            <p className="font-semibold">{title}</p>
            {children && <div className="mt-1">{children}</div>}
        </div>
    )
}

function LoadingBlock() {
    return (
        <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
            <div className="h-28 rounded-[10px] bg-[#e3e8f0]" />
            <div className="h-16 rounded-[10px] bg-[#e3e8f0]" />
            <div className="h-64 rounded-[10px] bg-[#e3e8f0]" />
        </div>
    )
}

export function formatMoney(money: { amountMinor: number; currency: string }): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: money.currency }).format(money.amountMinor / 100)
}

