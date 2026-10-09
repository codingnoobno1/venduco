// Mobile-optimized navigation bar
"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MobileMenuIcon } from "@/components/ui/mobile-menu-icon"

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navLinks = [
        { href: "#features", label: "Features" },
        { href: "#capabilities", label: "Capabilities" },
        { href: "#stakeholders", label: "Stakeholders" },
        { href: "#contact", label: "Contact" },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex h-14 sm:h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">VC</span>
                        </div>
                        <span className="hidden sm:block text-lg font-bold text-slate-900 dark:text-white">
                            VendorConnect
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA Button - Desktop */}
                    <div className="hidden md:block">
                        <Button asChild>
                            <Link href="/login">Handle Project</Link>
                        </Button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <MobileMenuIcon isOpen={isMobileMenuOpen} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
                    isMobileMenuOpen ? "max-h-96" : "max-h-0"
                )}
            >
                <div className="container mx-auto px-4 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="block py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <Button asChild fullWidth className="mt-4">
                        <Link href="/login">Handle Project</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
