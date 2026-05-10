"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ProposalSection } from './ProposalSection'

interface ProposalPreviewProps {
    vendorData: any
    template: string
}

export function ProposalPreview({ vendorData, template }: ProposalPreviewProps) {
    const companyName = vendorData?.companyIdentity?.companyName || vendorData?.representativeProfile?.basicIdentity?.fullName || "BuildIT Global Corp"
    const established = vendorData?.companyIdentity?.yearEstablished || 2006
    const location = vendorData?.companyIdentity?.registeredLocation?.city || "New Delhi"
    const exp = vendorData?.representativeProfile?.experienceSnapshot?.totalExperienceRange || "18+"
    const projects = vendorData?.executedProjects || []
    const equipment = vendorData?.equipmentDeployment || []

    const getTemplateStyles = () => {
        switch (template) {
            case 'executive':
                return {
                    container: "bg-slate-50 dark:bg-slate-900 border-t-8 border-slate-900 dark:border-white",
                    accent: "text-slate-900 dark:text-white",
                    section: "border-l-2 border-slate-900 dark:border-slate-500 pl-6",
                    font: "font-serif"
                }
            case 'compliance':
                return {
                    container: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                    accent: "text-blue-900 dark:text-blue-400",
                    section: "bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-100 dark:border-slate-800",
                    font: "font-mono text-xs"
                }
            default: // modern
                return {
                    container: "bg-white dark:bg-slate-800",
                    accent: "text-blue-600",
                    section: "space-y-4",
                    font: "font-sans"
                }
        }
    }

    const styles = getTemplateStyles()

    return (
        <Card className={`border-none shadow-2xl overflow-hidden print:shadow-none transition-all duration-500 ${styles.container} ${styles.font}`}>
            {template === 'modern' && <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />}
            <CardContent className="p-12 space-y-12">
                {/* Proposal Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className={`text-4xl font-extrabold tracking-tight mb-2 uppercase ${styles.accent}`}>
                            {template === 'compliance' ? 'Compliance & Technical Response' : 'Technical Proposal'}
                        </h2>
                        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">TENDER REF: HIGHWAY-2024-089</p>
                    </div>
                    <div className="text-right">
                        <div className={`w-16 h-16 rounded-xl ml-auto mb-2 flex items-center justify-center text-white font-black text-2xl shadow-lg ${template === 'executive' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-blue-600'}`}>
                            {companyName[0].toUpperCase()}
                        </div>
                        <p className={`font-black text-lg uppercase tracking-tighter leading-none ${styles.accent}`}>{companyName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ESTABLISHED {established}</p>
                    </div>
                </div>

                {/* Proposal Body */}
                <div className="space-y-10">
                    <div className={styles.section}>
                        <ProposalSection title="1. Executive Summary">
                            <span className="font-bold">{companyName}</span> is pleased to submit this proposal for the Highway Expansion Project. With over <span className="underline decoration-blue-500 decoration-2">{exp} years</span> of industry leadership and a base in <span className="font-bold">{location}</span>, we are uniquely positioned to deliver this project with absolute precision. Our execution capacity and past track record ensures we can mobilize resources within 72 hours of work-order issuance.
                        </ProposalSection>
                    </div>

                    <div className={styles.section}>
                        <ProposalSection title="2. Technical Approach & Specialization">
                            Our approach involves specialized application of <span className="bg-blue-50 dark:bg-blue-900/30 px-1 rounded">Advanced Earthmoving Logistics</span>.
                            {projects.length > 0 ? (
                                <>
                                    We leverage our experience from projects like <span className="font-bold">{projects[0].projectName}</span> for {projects[0].clientName}, where we successfully managed {projects[0].scopeOfWork.workType}.
                                </>
                            ) : (
                                <>We bring a deep understanding of local terrain and regulatory frameworks, ensuring zero-bottleneck execution during the monsoon window.</>
                            )}
                        </ProposalSection>
                    </div>

                    {equipment.length > 0 && (
                        <div className={styles.section}>
                            <ProposalSection title="3. Asset Readiness">
                                {companyName} maintains a robust fleet including:
                                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                    {equipment.slice(0, 3).map((eq: any, i: number) => (
                                        <li key={i}>{eq.machines[0].machineType} ({eq.machines[0].deployableRange} units available)</li>
                                    ))}
                                </ul>
                            </ProposalSection>
                        </div>
                    )}

                    <div className={styles.section}>
                        <ProposalSection title={template === 'compliance' ? '4. Compliance & Commercial' : '4. Financial Integrity'}>
                            We offer a competitive, high-value commercial structure optimized for long-term infrastructure health. Our pricing reflects our operational efficiency gained through {exp} years of specializing in large-scale infrastructure works.
                        </ProposalSection>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authorized Signatory</p>
                        <p className={`text-2xl font-medium italic ${styles.accent}`}>
                            {vendorData?.representativeProfile?.basicIdentity?.fullName || "John Doe"}
                        </p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
                            {vendorData?.representativeProfile?.roleType || "Chief Executive Officer"}
                        </p>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-widest text-right">
                        <p>GENERATED BY VENDUCO AI SYSTEMS</p>
                        <p className={`mt-1 font-black ${styles.accent} opacity-50`}>PROPOSAL-ID: AI-{Math.random().toString(16).slice(2, 10).toUpperCase()}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
