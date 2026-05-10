"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain } from 'lucide-react'
import { AIPageContainer } from '@/components/dashboard/vendor/ai-proposal/AIPageContainer'
import { AIHeader } from '@/components/dashboard/vendor/ai-proposal/AIHeader'
import { ProposalStepIndicator } from '@/components/dashboard/vendor/ai-proposal/ProposalStepIndicator'
import { TenderUploader } from '@/components/dashboard/vendor/ai-proposal/TenderUploader'
import { AIAnalyzingAnimation } from '@/components/dashboard/vendor/ai-proposal/AIAnalyzingAnimation'
import { AIProgressBar } from '@/components/dashboard/vendor/ai-proposal/AIProgressBar'
import { AnalysisStatus } from '@/components/dashboard/vendor/ai-proposal/AnalysisStatus'
import { TemplateGrid } from '@/components/dashboard/vendor/ai-proposal/TemplateGrid'
import { ProposalPreview } from '@/components/dashboard/vendor/ai-proposal/ProposalPreview'
import { ProposalSummaryMock } from '@/components/dashboard/vendor/ai-proposal/ProposalSummaryMock'
import { ProposalStats } from '@/components/dashboard/vendor/ai-proposal/ProposalStats'
import { AIInsights } from '@/components/dashboard/vendor/ai-proposal/AIInsights'
import { DownloadButton } from '@/components/dashboard/vendor/ai-proposal/DownloadButton'
import { RequirementsList } from '@/components/dashboard/vendor/ai-proposal/RequirementsList'
import { CompanyInfoMock } from '@/components/dashboard/vendor/ai-proposal/CompanyInfoMock'
import { ProposalEditorMock } from '@/components/dashboard/vendor/ai-proposal/ProposalEditorMock'
import { AITabSwitcher } from '@/components/dashboard/vendor/ai-proposal/AITabSwitcher'
import { AIFeaturesGrid } from '@/components/dashboard/vendor/ai-proposal/AIFeaturesGrid'
import { AIRAWOutputMock } from '@/components/dashboard/vendor/ai-proposal/AIRAWOutputMock'
import { AISparkleOverlay } from '@/components/dashboard/vendor/ai-proposal/AISparkleOverlay'
import { AIBtnWand } from '@/components/dashboard/vendor/ai-proposal/AIBtnWand'
import { AIFeedbackToast } from '@/components/dashboard/vendor/ai-proposal/AIFeedbackToast'
import { PDFViewerMock } from '@/components/dashboard/vendor/ai-proposal/PDFViewerMock'
import { AIModeBadge } from '@/components/dashboard/vendor/ai-proposal/AIModeBadge'
import { TenderStructureMap } from '@/components/dashboard/vendor/ai-proposal/TenderStructureMap'
import { ProposalReasoningPanel } from '@/components/dashboard/vendor/ai-proposal/ProposalReasoningPanel'
import { ComplianceCoverage } from '@/components/dashboard/vendor/ai-proposal/ComplianceCoverage'
import { RiskFlags } from '@/components/dashboard/vendor/ai-proposal/RiskFlags'
import { ProposalToneSelector } from '@/components/dashboard/vendor/ai-proposal/ProposalToneSelector'
import { ProposalVersionHistory } from '@/components/dashboard/vendor/ai-proposal/ProposalVersionHistory'
import { AIFlowGate } from '@/components/dashboard/vendor/ai-proposal/AIFlowGate'
import { AITenderSolutionView } from '@/components/dashboard/vendor/ai-proposal/AITenderSolutionView'
import { LTProposalTemplate } from '@/components/dashboard/vendor/ai-proposal/LTProposalTemplate'
import { CommercialBOQ } from '@/components/dashboard/vendor/ai-proposal/CommercialBOQ'
import { EligibilityScoring } from '@/components/dashboard/vendor/ai-proposal/EligibilityScoring'
import { AICopilot } from '@/components/dashboard/vendor/ai-proposal/AICopilot'
import { useEffect, useState } from 'react'

const ANALYSIS_STEPS = [
    "Reading PDF chunks...",
    "Extracting technical specifications...",
    "Scanning Section 4: Eligibility Criteria...",
    "Identifying mandatory compliance items...",
    "Parsing Commercial terms & Deadlines...",
    "Cross-referencing machine fleet availability...",
    "Analyzing historical win probability...",
    "Building requirement-capability matrix...",
    "Finalizing requirements summary..."
]

export default function AIProposalMakerPage() {
    const [step, setStep] = React.useState(0) // 0: Upload, 1: Analysis, 2: Template, 3: Generation, 4: Finalize
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)
    const [analysisProgress, setAnalysisProgress] = React.useState(0)
    const [statusIndex, setStatusIndex] = React.useState(0)
    const [selectedTemplate, setSelectedTemplate] = React.useState('modern')
    const [selectedTone, setSelectedTone] = useState('balanced')
    const [showToast, setShowToast] = useState(false)
    const [toastMsg, setToastMsg] = useState("")
    const [vendorProfile, setVendorProfile] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'preview' | 'tender' | 'analysis'>('preview')

    useEffect(() => {
        fetch('/api/vendors/profile')
            .then(res => res.json())
            .then(json => {
                if (json.success) setVendorProfile(json.data)
            })
            .catch(err => console.error('Error fetching vendor profile:', err))
    }, [])

    const triggerToast = (msg: string) => {
        setToastMsg(msg)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    const startAnalysis = () => {
        setIsAnalyzing(true)
        setStep(1)

        let progress = 0
        // Slower, randomized but bounded timing (18-25 seconds)
        const totalDuration = 18000 + Math.random() * 7000
        const intervalTime = 200
        const stepIncrement = (100 / (totalDuration / intervalTime))

        const interval = setInterval(() => {
            progress += stepIncrement * (0.5 + Math.random())
            if (progress >= 100) {
                progress = 100
                clearInterval(interval)
                setTimeout(() => {
                    setIsAnalyzing(false)
                    setStep(1.5) // Requirements review
                    triggerToast("Analysis complete. Review extracted requirements.")
                }, 1000)
            }
            setAnalysisProgress(progress)
            // Update status index based on progress
            const newIndex = Math.floor((progress / 100) * ANALYSIS_STEPS.length)
            setStatusIndex(Math.min(newIndex, ANALYSIS_STEPS.length - 1))
        }, intervalTime)
    }

    const goToTemplate = () => {
        setStep(2)
        triggerToast("Analyzing best fit templates for your vendor profile...")
    }

    const generateProposal = () => {
        setStep(3)
        triggerToast("Synthesizing final proposal document...")
        setTimeout(() => {
            setStep(4)
            triggerToast("Proposal generated successfully!")
        }, 4000)
    }

    return (
        <AIPageContainer>
            <AISparkleOverlay />
            <div className="relative z-10 space-y-12 pb-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <AIHeader />
                    <AIModeBadge />
                </div>

                <ProposalStepIndicator currentStep={Math.floor(step)} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Panel: Workflow */}
                    <div className="lg:col-span-8 space-y-8">
                        {step === 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <TenderUploader onUpload={startAnalysis} />
                                <div className="mt-12">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Available AI Tools</h4>
                                    <AIFeaturesGrid />
                                </div>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 py-12">
                                <AIAnalyzingAnimation />
                                <div className="max-w-xl mx-auto space-y-8">
                                    <AnalysisStatus status={ANALYSIS_STEPS[statusIndex] || "Finishing up..."} />
                                    <AIProgressBar progress={analysisProgress} />
                                    <AIRAWOutputMock />
                                </div>
                            </motion.div>
                        )}

                        {step === 1.5 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Requirements extraction</h3>
                                            <p className="text-slate-500 text-sm">Review identified clauses before generation.</p>
                                        </div>
                                        <AIBtnWand onClick={goToTemplate}>Approve & Continue</AIBtnWand>
                                    </div>
                                    <RequirementsList />
                                </div>
                                <AITenderSolutionView vendorData={vendorProfile} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TenderStructureMap />
                                    <CompanyInfoMock />
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <ProposalToneSelector value={selectedTone} onChange={setSelectedTone} />
                                <AIFlowGate isLocked={step < 2} message="Complete analysis to unlock styling framework.">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Select Framework</h3>
                                                <p className="text-slate-500 text-sm">Differentiated based on enterprise requirements.</p>
                                            </div>
                                            <AIBtnWand onClick={generateProposal}>Draft Proposal</AIBtnWand>
                                        </div>
                                        <TemplateGrid selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
                                    </div>
                                </AIFlowGate>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center py-32 space-y-8">
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl"
                                >
                                    <Sparkles className="w-12 h-12 text-white" />
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Synthesizing Enterprise Proposal...</h3>
                                    <p className="text-slate-500 animate-pulse font-medium">Applying {selectedTone} tone to {selectedTemplate} framework.</p>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                                    <AITabSwitcher currentStep={step} onStepClick={(s) => setStep(s === 0 ? 1.5 : s === 1 ? 1.5 : s === 2 ? 2 : 4)} />
                                    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                                        <button
                                            onClick={() => setViewMode('preview')}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500'}`}
                                        >
                                            PROPOSAL DRAFT
                                        </button>
                                        <button
                                            onClick={() => setViewMode('tender')}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'tender' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500'}`}
                                        >
                                            SOURCE TENDER
                                        </button>
                                        <button
                                            onClick={() => setViewMode('analysis')}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'analysis' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600' : 'text-slate-500'}`}
                                        >
                                            ANALYSIS
                                        </button>
                                    </div>
                                    <DownloadButton />
                                </div>
                                <div className="min-h-[800px]">
                                    {viewMode === 'preview' && <LTProposalTemplate />}
                                    {viewMode === 'tender' && <PDFViewerMock />}
                                    {viewMode === 'analysis' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <EligibilityScoring />
                                            <CommercialBOQ />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Panel: AI Context */}
                    <div className="lg:col-span-4 space-y-6">
                        {step >= 1.5 && (
                            <div className="sticky top-6 space-y-6">
                                <ProposalReasoningPanel />
                                <ComplianceCoverage />
                                <RiskFlags />
                                <ProposalSummaryMock />
                                {step === 4 && (
                                    <>
                                        <ProposalStats />
                                        <ProposalVersionHistory />
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Collaborative Editor</h4>
                                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold">STABLE DRAFT</span>
                                            </div>
                                            <ProposalEditorMock />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {(step === 0 || step === 1) && (
                            <div className="bg-slate-900 p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Brain className="w-48 h-48" />
                                </div>
                                <h4 className="font-black text-xl text-white relative z-10 tracking-tight">Enterprise AI Workflow</h4>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Process discipline</p>
                                        <p className="text-sm text-slate-400">Sequential validation prevents skipping critical compliance reviews.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Scoring Accuracy</p>
                                        <p className="text-sm text-slate-400">Requirements are weight-matched against your historical 18-year dataset.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">Risk Reduction</p>
                                        <p className="text-sm text-slate-400">Every AI draft is flagged with potential uncertainties for human-in-the-loop review.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AICopilot />

            <AIFeedbackToast visible={showToast} message={toastMsg} />
        </AIPageContainer>
    )
}
