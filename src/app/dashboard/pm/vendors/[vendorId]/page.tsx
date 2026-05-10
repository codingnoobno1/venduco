// PM Vendor Profile Page (V2 Trust-Based Model)
"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Building2, MapPin, Mail, Phone, Truck, CheckCircle2,
    Shield, Banknote, History, Briefcase, Users, LayoutDashboard
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'

export default function VendorProfilePage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [vendor, setVendor] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('trust')

    useEffect(() => {
        fetchVendor()
    }, [vendorId])

    async function fetchVendor() {
        const token = localStorage.getItem('token')
        try {
            const [userRes, profileRes] = await Promise.all([
                fetch(`/api/vendors/${vendorId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/vendors/${vendorId}/profile`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            const userData = await userRes.json()
            const profileData = await profileRes.json()

            if (userData.success) setVendor(userData.data)
            if (profileData.success) setProfile(profileData.data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSkeleton type="card" count={4} />

    if (!vendor) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-500">Vendor not found</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Go Back</button>
            </div>
        )
    }

    const tabs = [
        { id: 'trust', label: 'Trust & Overview', icon: Shield },
        { id: 'execution', label: 'Execution History', icon: History },
        { id: 'capacity', label: 'Capacity & Assets', icon: Users },
    ]

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendor Trust Profile</h1>
                        <p className="text-slate-500 mt-1">Trust-based assessment of capability and execution history.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700">
                        {profile?.representativeProfile?.basicIdentity?.fullName?.[0] || vendor.name?.[0]?.toUpperCase() || 'V'}
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900">{profile?.representativeProfile?.basicIdentity?.fullName || vendor.name}</h2>
                            {profile?.representativeProfile?.roleType && (
                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                                    {profile.representativeProfile.roleType}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 font-medium">{vendor.name}</p>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                            {profile?.representativeProfile?.professionalBackground?.highestEducation && (
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-600">
                                    <Briefcase size={14} className="text-slate-400" />
                                    {profile.representativeProfile.professionalBackground.highestEducation}
                                    {profile.representativeProfile.professionalBackground.educationDomain ? ` (${profile.representativeProfile.professionalBackground.educationDomain})` : ''}
                                </span>
                            )}
                            {profile?.representativeProfile?.basicIdentity?.currentCity && (
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-600">
                                    <MapPin size={14} className="text-slate-400" /> {profile.representativeProfile.basicIdentity.currentCity}
                                </span>
                            )}
                            {profile?.companyIdentity?.yearEstablished && (
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-600">
                                    <Building2 size={14} className="text-slate-400" /> Est. {profile.companyIdentity.yearEstablished}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm font-bold border border-green-100 flex items-center gap-2">
                            <Shield size={16} /> Trust Score: {profile?.systemTrustScore?.projectsInSystem ? 'Verified' : 'New'}
                        </div>
                        {profile?.representativeProfile?.experienceSnapshot?.totalExperienceRange && (
                            <div className="text-xs text-slate-500 text-right">
                                Exp: <strong>{profile.representativeProfile.experienceSnapshot.totalExperienceRange} Years</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    {activeTab === 'trust' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-full md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase size={20} className="text-blue-500" /> Service Offerings</h3>
                                <div className="space-y-4">
                                    {(profile?.serviceOfferings || []).map((svc: any, idx: number) => (
                                        <div key={idx} className="border-b last:border-0 border-slate-100 pb-4 last:pb-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800">{svc.serviceDomain}</h4>
                                                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                    {svc.executionMethod?.mode}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {svc.workTypes?.map((type: string) => (
                                                    <span key={type} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(!profile?.serviceOfferings || profile.serviceOfferings.length === 0) && (
                                        <p className="text-slate-400 italic text-sm">No services listed yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">System Trust</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-800">{profile?.systemTrustScore?.projectsInSystem || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase">Projects</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-800">{profile?.systemTrustScore?.sectionsCompleted || 0}</div>
                                            <div className="text-xs text-slate-500 uppercase">Sections</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-500 uppercase mb-2">Bio</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {profile?.companyIdentity?.bio || 'No bio provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'execution' && (
                        <div className="space-y-6">
                            {/* Projects Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(profile?.executedProjects || []).map((proj: any, idx: number) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{proj.projectName}</h4>
                                                <p className="text-sm text-slate-500">{proj.clientName}</p>
                                            </div>
                                            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 uppercase">
                                                {proj.commercialContext?.valueRange?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 uppercase font-bold">
                                                <div>Role: <span className="text-slate-700">{proj.vendorRole}</span></div>
                                                <div>Type: <span className="text-slate-700">{proj.clientType}</span></div>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-600">
                                                &ldquo;{proj.scopeOfWork?.description || 'No description provided.'}&rdquo;
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                                                <span>Executed: {proj.executionScale?.quantityExecuted} {proj.executionScale?.quantityType}</span>
                                                {/* No Verifier Info Here as per Trust-Based Logic */}
                                                <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> Self-Attested</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!profile?.executedProjects || profile.executedProjects.length === 0) && (
                                    <div className="col-span-full text-center py-12 text-slate-400">
                                        No executed projects listed.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'capacity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Functional Teams */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Users size={20} className="text-indigo-500" /> Functional Capacity</h3>
                                {(!profile?.executionCapacity || profile.executionCapacity.length === 0) ? (
                                    <p className="text-slate-400 italic">No capacity data.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {profile.executionCapacity.map((cap: any, idx: number) => (
                                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200">
                                                <div className="flex justify-between mb-3">
                                                    <h4 className="font-bold text-slate-800">{cap.domain}</h4>
                                                    {cap.leadershipLevel?.hasDedicatedLead && (
                                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                                            <CheckCircle2 size={12} /> Dedicated PM
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    <div className="bg-slate-50 p-2 rounded">
                                                        <div className="font-bold">{cap.workforceStrength?.engineers || '0'}</div>
                                                        <div className="text-[10px] uppercase text-slate-500">Eng</div>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded">
                                                        <div className="font-bold">{cap.workforceStrength?.supervisors || '0'}</div>
                                                        <div className="text-[10px] uppercase text-slate-500">Sup</div>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded">
                                                        <div className="font-bold">{cap.workforceStrength?.skilledLabour || '0'}</div>
                                                        <div className="text-[10px] uppercase text-slate-500">Labor</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-xs text-slate-500 text-center border-t border-slate-100 pt-2">
                                                    Leader Exp: <strong>{cap.leadershipLevel?.leadExperienceRange?.replace(/_/g, ' ')}</strong>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Equipment Fleet */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Truck size={20} className="text-orange-500" /> Deployable Fleet</h3>
                                {(!profile?.equipmentDeployment || profile.equipmentDeployment.length === 0) ? (
                                    <p className="text-slate-400 italic">No fleet data.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {profile.equipmentDeployment.map((group: any, idx: number) => (
                                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200">
                                                <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{group.workType}</h4>
                                                <div className="space-y-2">
                                                    {group.machines?.map((m: any, mIdx: number) => (
                                                        <div key={mIdx} className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-600">{m.machineType}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold">{m.deployableRange} Units</span>
                                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{m.source}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
