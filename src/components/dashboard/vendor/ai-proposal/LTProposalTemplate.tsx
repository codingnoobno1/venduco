"use client"

import React from 'react'
import { Printer, FileCheck2, ShieldAlert, BadgeCheck } from 'lucide-react'

interface LTProposalProps {
    tenderNo?: string
    yearsExp?: number
    workingPressure?: number
    materialCost?: string
    installationCost?: string
    transportCost?: string
    gstAmount?: string
    grandTotal?: string
    vendorName?: string
}

export function LTProposalTemplate({
    tenderNo = "MCF-HYD-2025-001",
    yearsExp = 18,
    workingPressure = 150,
    materialCost = "7,72,000",
    installationCost = "1,52,100",
    transportCost = "5,070",
    gstAmount = "8,65,539", // Using User's provided value from Snapshot 14
    grandTotal = "17,94,709", // Updated Sum: 7,72,000 + 1,52,100 + 5,070 + 8,65,539
    vendorName = "Larsen & Toubro"
}: LTProposalProps) {
    return (
        <div className="bg-white text-slate-900 p-12 shadow-2xl border border-slate-200 max-w-4xl mx-auto font-serif leading-relaxed print:shadow-none print:border-none">
            {/* Header / Logo Section */}
            <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase">{vendorName}</h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-600">Infrastructure & Engineering Division</p>
                </div>
                <div className="text-right text-xs font-bold uppercase space-y-1">
                    <p>Standard Tender Submission</p>
                    <p>Corporate ID: L99999MH1946PLC004768</p>
                    <p>ISO 9001:2015 Certified</p>
                </div>
            </div>

            {/* Section 1: Cover Letter */}
            <section className="mb-12">
                <div className="mb-6">
                    <p className="font-bold">To,</p>
                    <p>The Tender Inviting Authority</p>
                    <p>Modern Coach Factory (MCF)</p>
                    <p>Raebareli – Indian Railways</p>
                </div>

                <div className="mb-8">
                    <p className="font-bold underline uppercase">
                        Subject: Submission of Bid for Replacement of Hydraulic Hoses – Tender No. {tenderNo}
                    </p>
                </div>

                <p className="mb-4">Dear Sir/Madam,</p>
                <p className="mb-4">
                    We, <span className="font-bold">{vendorName}</span>, hereby submit our bid against the above-mentioned tender in accordance with the terms, conditions, technical specifications, and commercial requirements laid down in the tender document.
                </p>
                <p>
                    We confirm that we have carefully examined all sections of the tender document including scope of work, eligibility conditions, technical specifications, compliance requirements, and general conditions of contract (GCC) for Works – April 2022.
                </p>
            </section>

            {/* Section 2: Company Profile */}
            <section className="mb-12">
                <h3 className="text-lg font-black border-l-4 border-slate-900 pl-4 mb-4 uppercase">2. Company Profile</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm ml-4">
                    <p className="font-bold">Name of Organization:</p>
                    <p>{vendorName}</p>
                    <p className="font-bold">Nature of Business:</p>
                    <p>Engineering, Manufacturing, Supply, Installation & Commissioning</p>
                    <p className="font-bold">Core Expertise:</p>
                    <p>Industrial hydraulics, High-pressure hydraulic systems, Engineering services for Railways & PSUs</p>
                    <p className="font-bold">Years of Experience:</p>
                    <p>{yearsExp} Years</p>
                    <p className="font-bold">Presence:</p>
                    <p>Pan-India</p>
                </div>
            </section>

            {/* Section 3: Understanding of Scope */}
            <section className="mb-12">
                <h3 className="text-lg font-black border-l-4 border-slate-900 pl-4 mb-4 uppercase">3. Understanding of Scope of Work</h3>
                <p className="text-sm mb-4 ml-4">Based on our review of the tender document, the scope of work includes:</p>
                <ul className="list-disc ml-10 text-sm space-y-1">
                    <li>Supply of hydraulic hoses of specified diameters and lengths</li>
                    <li>Hoses suitable for working pressure up to <span className="font-bold">{workingPressure} Bar</span></li>
                    <li>Installation and commissioning of supplied hoses at MCF Raebareli site</li>
                    <li>Transportation and logistics management</li>
                    <li>Full compliance with Indian Railways safety standards</li>
                </ul>
            </section>

            {/* Section 4: Technical Compliance */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <FileCheck2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-black border-l-4 border-slate-900 pl-4 uppercase">4. Technical Compliance Statement</h3>
                </div>
                <div className="bg-slate-50 p-6 border border-slate-200 rounded ml-4 text-sm space-y-3">
                    <div className="flex justify-between border-b pb-2">
                        <span>Working Pressure Compliance ({workingPressure} Bar)</span>
                        <span className="font-bold text-green-700">✔ COMPLIANT</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span>Material Standards (Railway Approved)</span>
                        <span className="font-bold text-green-700">✔ COMPLIANT</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Technical Deviation proposed</span>
                        <span className="font-bold text-slate-500">NONE</span>
                    </div>
                </div>
            </section>

            {/* Section 6: Commercial Summary Table */}
            <section className="mb-12">
                <h3 className="text-lg font-black border-l-4 border-slate-900 pl-4 mb-6 uppercase">6. Commercial Summary</h3>
                <table className="w-full border-collapse border border-slate-300 ml-4 text-sm">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-3 text-left">Description</th>
                            <th className="border border-slate-300 p-3 text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border border-slate-300 p-3">Total Material Cost</td>
                            <td className="border border-slate-300 p-3 text-right font-mono">{materialCost}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-3">Installation & Commissioning</td>
                            <td className="border border-slate-300 p-3 text-right font-mono">{installationCost}</td>
                        </tr>
                        <tr>
                            <td className="border border-slate-300 p-3">Transportation Charges</td>
                            <td className="border border-slate-300 p-3 text-right font-mono">{transportCost}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                            <td className="border border-slate-300 p-3">GST @ 18%</td>
                            <td className="border border-slate-300 p-3 text-right font-mono">{gstAmount}</td>
                        </tr>
                        <tr className="bg-slate-900 text-white font-black text-lg">
                            <td className="border border-slate-300 p-3">Total Contract Value (Grand Total)</td>
                            <td className="border border-slate-300 p-3 text-right font-mono">₹ {grandTotal}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-4 ml-4 space-y-1 text-xs font-bold text-slate-500 uppercase italic">
                    <p>✔ Prices quoted are AT PAR</p>
                    <p>✔ Prices are inclusive of all duties, taxes, and statutory obligations</p>
                </div>
            </section>

            {/* Section 10: Signature */}
            <section className="mt-20 flex justify-end">
                <div className="text-center w-64 space-y-1">
                    <div className="border-b-2 border-slate-900 mb-2"></div>
                    <p className="font-black text-sm uppercase">Authorized Signatory</p>
                    <p className="text-xs">For {vendorName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-4">Date: {new Date().toLocaleDateString()}</p>
                    <div className="pt-2">
                        <div className="w-12 h-12 bg-slate-900/5 border border-dashed border-slate-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-[8px] text-slate-300 font-bold uppercase rotate-12">Official Seal</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
