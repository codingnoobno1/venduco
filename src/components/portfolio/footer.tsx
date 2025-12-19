// Footer component
"use client"

import * as React from "react"
import Link from "next/link"
import { Container } from "@/components/ui/container"

export function Footer() {
    const footerSections = [
        {
            title: "Product",
            links: [
                { label: "Features", href: "#features" },
                { label: "Capabilities", href: "#capabilities" },
                { label: "Pricing", href: "#pricing" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
                { label: "Careers", href: "#careers" },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "Documentation", href: "#docs" },
                { label: "Support", href: "#support" },
                { label: "Status", href: "#status" },
            ],
        },
    ]

    return (
        <footer className="bg-slate-900 text-slate-300">
            <Container maxWidth="xl" className="py-8 sm:py-12">
                {/* Footer Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
                    {/* Logo Column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">VC</span>
                            </div>
                            <span className="text-lg font-bold text-white">VendorConnect</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Infrastructure corridor coordination platform
                        </p>
                    </div>

                    {/* Links */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-white mb-3 sm:mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="text-sm text        -slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <p className="text-xs sm:text-sm text-slate-400">
                        © 2025 VendorConnect. All rights reserved.
                    </p>
                    <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
                        <a href="#privacy" className="text-slate-400 hover:text-white transition-colors">
                            Privacy
                        </a>
                        <a href="#terms" className="text-slate-400 hover:text-white transition-colors">
                            Terms
                        </a>
                        <a href="#security" className="text-slate-400 hover:text-white transition-colors">
                            Security
                        </a>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
