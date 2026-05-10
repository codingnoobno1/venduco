"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2, History, Briefcase, Users, Truck, ShieldCheck,
    Plus, Trash2, Save, MapPin, Calendar, DollarSign, AlertCircle, FileText
} from 'lucide-react'

// Helper Enums
const VALUE_RANGES = [
    { value: 'UNDER_1CR', label: 'Under ₹1 Cr' },
    { value: '1CR_TO_5CR', label: '₹1 Cr - ₹5 Cr' },
    { value: '5CR_TO_10CR', label: '₹5 Cr - ₹10 Cr' },
    { value: '10CR_TO_25CR', label: '₹10 Cr - ₹25 Cr' },
    { value: '25CR_TO_100CR', label: '₹25 Cr - ₹100 Cr' },
    { value: 'OVER_100CR', label: 'Over ₹100 Cr' }
]

const CLIENT_TYPES = ['GOVT', 'PSU', 'PRIVATE_EPC', 'PRIVATE_REAL_ESTATE']
const ROLES = ['MAIN_CONTRACTOR', 'SUB_CONTRACTOR', 'LABOUR_CONTRACTOR', 'CONSULTANT']

const AVAILABLE_SERVICES = [
    { domain: 'Roads & Highways', types: ['Earthwork', 'Embankment', 'PQC Paving', 'DLC', 'Kerb Casting'] },
    { domain: 'Structures', types: ['Piling', 'Pier Cap', 'Girders', 'Deck Slab', 'Rebar Works'] },
    { domain: 'Tunnels', types: ['NATM', 'TBM Operations', 'Shotconcreting', 'Rock Bolting'] },
    { domain: 'Metro & Rail', types: ['Viaduct Launching', 'Station Building', 'Track Work', 'OHE Foundations'] }
]

export function VendorCapabilityProfile() {
    const [activeTab, setActiveTab] = useState('identity')
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const token = localStorage.getItem('token')
        try {
            const [profileRes, meRes] = await Promise.all([
                fetch('/api/vendors/profile', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
            ])

            const profileData = await profileRes.json()
            const meData = await meRes.json()

            let finalProfile = profileData.success && profileData.data ? profileData.data : {
                companyIdentity: {},
                executedProjects: [],
                serviceOfferings: [],
                executionCapacity: [],
                equipmentDeployment: [],
                representativeProfile: { basicIdentity: {} }
            }

            // Auto-fill Human Identity if missing
            if (meData.success && meData.data) {
                const user = meData.data
                const currentYear = new Date().getFullYear()

                // 1. Human Representative Mapping
                const rep = finalProfile.representativeProfile || { basicIdentity: {} }
                const identity = rep.basicIdentity || {}

                if (!identity.fullName) identity.fullName = user.name
                if (!identity.personalEmail) identity.personalEmail = user.email
                if (!identity.phone && user.phone) identity.phone = user.phone
                if (!identity.currentCity && user.city) identity.currentCity = user.city

                // Map Role (Static)
                // Use requestedRole as the source of truth
                const role = user.requestedRole || user.role

                if (role === 'VENDOR') rep.roleType = 'OWNER'
                else if (role === 'COMPANY_REP') rep.roleType = 'PROJECT_HEAD'
                else if (role === 'PROJECT_MANAGER') rep.roleType = 'PROJECT_HEAD'
                else if (role === 'SUPERVISOR') rep.roleType = 'OPS_MANAGER'
                else rep.roleType = 'OPS_MANAGER' // Fallback

                rep.basicIdentity = identity
                finalProfile.representativeProfile = rep

                // 2. Company Identity Mapping
                const comp = finalProfile.companyIdentity || {}
                if (!comp.registeredLocation) comp.registeredLocation = {}

                // Map Business Type (Simple normalization)
                if (!comp.legalEntityType && user.businessType) {
                    const type = user.businessType.toUpperCase().replace(/ /g, '_')
                    if (['PROPRIETORSHIP', 'LLP', 'PVT_LTD', 'PUBLIC_LTD'].includes(type)) {
                        comp.legalEntityType = type
                    }
                }

                // Map Location
                if (!comp.registeredLocation.city && user.city) comp.registeredLocation.city = user.city
                if (!comp.registeredLocation.state && user.state) comp.registeredLocation.state = user.state

                // Map Year Established (Approximate from Years of Operation)
                if (!comp.yearEstablished && user.yearsOfOperation) {
                    comp.yearEstablished = currentYear - user.yearsOfOperation
                }

                finalProfile.companyIdentity = comp
            }

            setProfile(finalProfile)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function saveProfile() {
        setSaving(true)
        const token = localStorage.getItem('token')
        try {
            await fetch('/api/vendors/profile', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            })
            alert('Profile saved successfully!')
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>
    if (!profile) return <div>Error loading profile</div>

    const updateIdentity = (field: string, value: any) => {
        setProfile((p: any) => ({
            ...p,
            companyIdentity: {
                ...p.companyIdentity,
                [field]: field === 'registeredLocation' ? { ...p.companyIdentity.registeredLocation, ...value } : value
            }
        }))
    }

    const updateHuman = (field: string, value: any) => {
        setProfile((p: any) => ({
            ...p,
            representativeProfile: {
                ...p.representativeProfile,
                [field]: field === 'basicIdentity' || field === 'professionalBackground' || field === 'experienceSnapshot'
                    ? { ...p.representativeProfile?.[field], ...value } // Merge sub-objects
                    : value
            }
        }))
    }

    const tabs = [
        { id: 'identity', label: 'My Identity', icon: Users },
        { id: 'history', label: 'Execution History', icon: History },
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'capacity', label: 'Team Capacity', icon: Users },
        { id: 'fleet', label: 'Fleet', icon: Truck },
        { id: 'trust', label: 'System Trust', icon: ShieldCheck },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6 pt-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Vendor Capability Profile</h1>
                    <p className="text-slate-500">Trust-Based Logical Verification System</p>
                </div>
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                    >
                        {activeTab === 'identity' && (
                            <IdentityTab
                                identity={profile.companyIdentity || {}}
                                human={profile.representativeProfile || {}}
                                onChangeIdentity={updateIdentity}
                                onChangeHuman={updateHuman}
                            />
                        )}
                        {activeTab === 'history' && <HistoryTab projects={profile.executedProjects || []} onChange={(iso: any) => setProfile({ ...profile, executedProjects: iso })} />}
                        {activeTab === 'services' && <ServicesTab services={profile.serviceOfferings || []} onChange={(iso: any) => setProfile({ ...profile, serviceOfferings: iso })} />}
                        {activeTab === 'capacity' && <CapacityTab capacity={profile.executionCapacity || []} onChange={(iso: any) => setProfile({ ...profile, executionCapacity: iso })} />}
                        {activeTab === 'fleet' && <FleetTab fleet={profile.equipmentDeployment || []} onChange={(iso: any) => setProfile({ ...profile, equipmentDeployment: iso })} />}
                        {activeTab === 'trust' && <TrustTab scores={profile.systemTrustScore || {}} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

function IdentityTab({ identity, human, onChangeIdentity, onChangeHuman }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* LEFT: Human Representative (Personal Trust) */}
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3 text-blue-800 dark:text-blue-300">
                    <Users size={20} className="shrink-0" />
                    <p className="text-sm">
                        <strong>My Representative Profile:</strong> This is who the Project Manager talks to.
                        Build trust with your personal experience and background.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Basic Identity</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <InputGroup label="Full Name" value={human.basicIdentity?.fullName} onChange={(v: any) => onChangeHuman('basicIdentity', { ...human.basicIdentity, fullName: v })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Role (System Assigned)</label>
                            <input type="text" value={human.roleType || ''} disabled className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age Range</label>
                            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                value={human.basicIdentity?.ageRange || ''}
                                onChange={(e) => onChangeHuman('basicIdentity', { ...human.basicIdentity, ageRange: e.target.value })}
                            >
                                <option value="">Select Age</option>
                                <option value="20-25">20-25</option>
                                <option value="25-30">25-30</option>
                                <option value="30-40">30-40</option>
                                <option value="40-55">40-55</option>
                                <option value="55+">55+</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <InputGroup label="Current City" value={human.basicIdentity?.currentCity} onChange={(v: any) => onChangeHuman('basicIdentity', { ...human.basicIdentity, currentCity: v })} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Professional Background</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Education</label>
                            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                value={human.professionalBackground?.highestEducation || ''}
                                onChange={(e) => onChangeHuman('professionalBackground', { ...human.professionalBackground, highestEducation: e.target.value })}
                            >
                                <option value="">Degree</option>
                                <option value="DIPLOMA">Diploma</option>
                                <option value="BTECH">B.Tech/B.E</option>
                                <option value="MTECH">M.Tech</option>
                                <option value="MBA">MBA</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <InputGroup label="Domain (e.g. Civil)" value={human.professionalBackground?.educationDomain} onChange={(v: any) => onChangeHuman('professionalBackground', { ...human.professionalBackground, educationDomain: v })} />
                        <div className="col-span-2">
                            <InputGroup label="Institution Name" value={human.professionalBackground?.institutionName} onChange={(v: any) => onChangeHuman('professionalBackground', { ...human.professionalBackground, institutionName: v })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Exp</label>
                            <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                value={human.experienceSnapshot?.totalExperienceRange || ''}
                                onChange={(e) => onChangeHuman('experienceSnapshot', { ...human.experienceSnapshot, totalExperienceRange: e.target.value })}
                            >
                                <option value="">Exp Range</option>
                                <option value="0-2">0 - 2 Yrs</option>
                                <option value="2-5">2 - 5 Yrs</option>
                                <option value="5-8">5 - 8 Yrs</option>
                                <option value="8-15">8 - 15 Yrs</option>
                                <option value="15+">15+ Yrs</option>
                            </select>
                        </div>
                        <div>
                            <InputGroup label="Expertise (comma sep)" value={human.experienceSnapshot?.primarySkills?.join(', ')} onChange={(v: any) => onChangeHuman('experienceSnapshot', { ...human.experienceSnapshot, primarySkills: v.split(',').map((s: string) => s.trim()) })} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Direct Contact</h3>
                    <div className="space-y-3">
                        <InputGroup label="Personal Email" value={human.basicIdentity?.personalEmail} onChange={(v: any) => onChangeHuman('basicIdentity', { ...human.basicIdentity, personalEmail: v })} />
                        <InputGroup label="Professional Email" value={human.basicIdentity?.professionalEmail} onChange={(v: any) => onChangeHuman('basicIdentity', { ...human.basicIdentity, professionalEmail: v })} />
                        <InputGroup label="Phone Number" value={human.basicIdentity?.phone} onChange={(v: any) => onChangeHuman('basicIdentity', { ...human.basicIdentity, phone: v })} />
                    </div>
                </div>
            </div>

            {/* RIGHT: Company Legal (Entity Trust) */}
            <div className="space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 text-slate-600">
                    <Building2 size={20} className="shrink-0" />
                    <p className="text-sm">
                        <strong>Legal Entity Details:</strong> Standard company registration details.
                    </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-lg text-slate-700">Company Identity</h3>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Legal Entity Type</label>
                        <select
                            value={identity.legalEntityType || ''}
                            onChange={(e) => onChangeIdentity('legalEntityType', e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                        >
                            <option value="">Select Type</option>
                            <option value="PROPRIETORSHIP">Proprietorship</option>
                            <option value="LLP">LLP</option>
                            <option value="PVT_LTD">Pvt Ltd</option>
                            <option value="PUBLIC_LTD">Public Ltd</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Year Established</label>
                        <input
                            type="number"
                            value={identity.yearEstablished || ''}
                            onChange={(e) => onChangeIdentity('yearEstablished', Number(e.target.value))}
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            placeholder="YYYY"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">City (Reg)</label>
                            <input
                                type="text"
                                value={identity.registeredLocation?.city || ''}
                                onChange={(e) => onChangeIdentity('registeredLocation', { ...identity.registeredLocation, city: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-lg"
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
                            <input
                                type="text"
                                value={identity.registeredLocation?.state || ''}
                                onChange={(e) => onChangeIdentity('registeredLocation', { ...identity.registeredLocation, state: e.target.value })}
                                className="w-full p-3 border border-slate-300 rounded-lg"
                                placeholder="State"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Company Bio</label>
                        <textarea
                            value={identity.bio || ''}
                            onChange={(e) => onChangeIdentity('bio', e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg h-32"
                            placeholder="Brief description of the company..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function HistoryTab({ projects, onChange }: any) {
    const addProject = () => {
        onChange([...projects, {
            id: Math.random().toString(),
            commercialContext: { valueRange: 'UNDER_1CR' },
            scopeOfWork: {},
            duration: {}
        }])
    }

    const updateProject = (idx: number, field: string, value: any) => {
        const updated = [...projects]
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            updated[idx][parent] = { ...updated[idx][parent], [child]: value }
        } else {
            updated[idx][field] = value
        }
        onChange(updated)
    }

    const removeProject = (idx: number) => {
        onChange(projects.filter((_: any, i: number) => i !== idx))
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 border border-blue-100">
                <History size={20} className="shrink-0" />
                <p className="text-sm">
                    <strong>Logical Trust Building:</strong> List specific projects with realistic details.
                    Ranges (Value, Quantity) build more trust than exact unverified numbers.
                </p>
            </div>

            <div className="flex justify-end">
                <button onClick={addProject} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
                    <Plus size={16} /> Add Executed Project
                </button>
            </div>

            <div className="space-y-4">
                {projects.map((proj: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative group">
                        <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <InputGroup label="Project Name" value={proj.projectName} onChange={(v: any) => updateProject(idx, 'projectName', v)} />
                            <InputGroup label="Client Name" value={proj.clientName} onChange={(v: any) => updateProject(idx, 'clientName', v)} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Client Type</label>
                                <select
                                    value={proj.clientType || ''}
                                    onChange={(e) => updateProject(idx, 'clientType', e.target.value)}
                                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="">Select</option>
                                    {CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                <input
                                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                    placeholder="e.g. Roads"
                                    value={proj.projectCategory || ''}
                                    onChange={(e) => updateProject(idx, 'projectCategory', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                <select
                                    value={proj.vendorRole || ''}
                                    onChange={(e) => updateProject(idx, 'vendorRole', e.target.value)}
                                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="">Select</option>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Value Range</label>
                                <select
                                    value={proj.commercialContext?.valueRange || ''}
                                    onChange={(e) => updateProject(idx, 'commercialContext.valueRange', e.target.value)}
                                    className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                >
                                    {VALUE_RANGES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Scope Description</label>
                            <textarea
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                placeholder="Describe specifically what you executed..."
                                value={proj.scopeOfWork?.description || ''}
                                onChange={(e) => updateProject(idx, 'scopeOfWork.description', e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 w-fit">
                            <div className="text-sm font-bold text-slate-700">Executed Scale:</div>
                            <input
                                placeholder="Qty"
                                type="number"
                                className="w-24 p-1 border-b border-slate-300 text-sm outline-none"
                                value={proj.executionScale?.quantityExecuted || ''}
                                onChange={(e) => updateProject(idx, 'executionScale.quantityExecuted', Number(e.target.value))}
                            />
                            <input
                                placeholder="Unit (km/cum)"
                                className="w-24 p-1 border-b border-slate-300 text-sm outline-none"
                                value={proj.executionScale?.quantityType || ''}
                                onChange={(e) => updateProject(idx, 'executionScale.quantityType', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ServicesTab({ services, onChange }: any) {
    const toggleService = (domain: string) => {
        const exists = services.find((s: any) => s.serviceDomain === domain)
        if (exists) {
            onChange(services.filter((s: any) => s.serviceDomain !== domain))
        } else {
            onChange([...services, {
                serviceDomain: domain,
                workTypes: [],
                executionMethod: { mode: 'MECHANIZED', constraints: [] }
            }])
        }
    }

    const toggleWorkType = (domain: string, type: string) => {
        onChange(services.map((s: any) => {
            if (s.serviceDomain !== domain) return s
            const hasType = s.workTypes.includes(type)
            return {
                ...s,
                workTypes: hasType ? s.workTypes.filter((t: string) => t !== type) : [...s.workTypes, type]
            }
        }))
    }

    const updateMethod = (domain: string, field: string, value: any) => {
        onChange(services.map((s: any) => {
            if (s.serviceDomain !== domain) return s
            return { ...s, executionMethod: { ...s.executionMethod, [field]: value } }
        }))
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-700">current Capability</h3>

            <div className="grid grid-cols-1 gap-6">
                {AVAILABLE_SERVICES.map((svc) => {
                    const activeService = services.find((s: any) => s.serviceDomain === svc.domain)
                    const isSelected = !!activeService

                    return (
                        <div key={svc.domain} className={`border rounded-xl p-4 transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleService(svc.domain)}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-bold text-lg">{svc.domain}</span>
                            </div>

                            {isSelected && (
                                <div className="pl-8 space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {svc.types.map(type => (
                                            <label key={type} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-slate-200 hover:border-blue-300 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={activeService.workTypes?.includes(type)}
                                                    onChange={() => toggleWorkType(svc.domain, type)}
                                                    className="rounded border-slate-200 text-blue-600"
                                                />
                                                {type}
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 w-fit">
                                        <label className="text-xs font-bold uppercase text-slate-500">Execution Mode:</label>
                                        <select
                                            value={activeService.executionMethod?.mode || 'MECHANIZED'}
                                            onChange={(e) => updateMethod(svc.domain, 'mode', e.target.value)}
                                            className="bg-transparent font-bold text-sm text-blue-600 outline-none"
                                        >
                                            <option value="MANUAL">Manual Only</option>
                                            <option value="SEMI_MECH">Semi-Mechanized</option>
                                            <option value="MECHANIZED">Fully Mechanized</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function CapacityTab({ capacity, onChange }: any) {
    const addTeam = () => {
        onChange([...capacity, {
            id: Math.random().toString(),
            domain: '',
            leadershipLevel: { leadExperienceRange: '5_TO_10YRS' },
            workforceStrength: { engineers: '1-2', supervisors: '1-2', skilledLabour: '1-10' },
            qualityReadiness: { safetyTraining: false }
        }])
    }

    const updateTeam = (idx: number, field: string, value: any) => {
        const updated = [...capacity]
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            updated[idx][parent] = { ...updated[idx][parent], [child]: value }
        } else {
            updated[idx][field] = value
        }
        onChange(updated)
    }

    const removeTeam = (idx: number) => {
        onChange(capacity.filter((_: any, i: number) => i !== idx))
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 border border-blue-100">
                <Users size={20} className="shrink-0" />
                <p className="text-sm">
                    <strong>Capacity Bands:</strong> Define your standing team strength.
                    PMs see these as "Available Capacity" rather than verified individuals.
                </p>
            </div>
            <div className="flex justify-end">
                <button onClick={addTeam} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
                    <Plus size={16} /> Add Domain Capacity
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {capacity.map((team: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative group">
                        <button onClick={() => removeTeam(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Domain</label>
                            <select
                                value={team.domain}
                                onChange={(e) => updateTeam(idx, 'domain', e.target.value)}
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold"
                            >
                                <option value="">Select Domain...</option>
                                {AVAILABLE_SERVICES.map(s => <option key={s.domain} value={s.domain}>{s.domain}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="font-bold text-sm text-slate-700 mb-3">Leadership</h5>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={team.leadershipLevel?.hasDedicatedLead}
                                            onChange={(e) => updateTeam(idx, 'leadershipLevel.hasDedicatedLead', e.target.checked)}
                                        />
                                        Has Dedicated Project Manager
                                    </label>
                                    <div>
                                        <label className="text-xs text-slate-400">Experience Range</label>
                                        <select
                                            value={team.leadershipLevel?.leadExperienceRange}
                                            onChange={(e) => updateTeam(idx, 'leadershipLevel.leadExperienceRange', e.target.value)}
                                            className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded text-sm"
                                        >
                                            <option value="UNDER_5YRS">Under 5 Years</option>
                                            <option value="5_TO_10YRS">5 - 10 Years</option>
                                            <option value="10_TO_15YRS">10 - 15 Years</option>
                                            <option value="OVER_15YRS">Over 15 Years</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="font-bold text-sm text-slate-700 mb-3">Workforce Strength</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-400">Engineers</label>
                                        <select
                                            value={team.workforceStrength?.engineers}
                                            onChange={(e) => updateTeam(idx, 'workforceStrength.engineers', e.target.value)}
                                            className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded text-sm"
                                        >
                                            <option value="0">0</option>
                                            <option value="1-2">1-2</option>
                                            <option value="3-5">3-5</option>
                                            <option value="6-10">6-10</option>
                                            <option value="10+">10+</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400">Supervisors</label>
                                        <select
                                            value={team.workforceStrength?.supervisors}
                                            onChange={(e) => updateTeam(idx, 'workforceStrength.supervisors', e.target.value)}
                                            className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded text-sm"
                                        >
                                            <option value="0">0</option>
                                            <option value="1-2">1-2</option>
                                            <option value="3-5">3-5</option>
                                            <option value="6-10">6-10</option>
                                            <option value="10+">10+</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-400">Skilled Labor (Headcount)</label>
                                        <select
                                            value={team.workforceStrength?.skilledLabour}
                                            onChange={(e) => updateTeam(idx, 'workforceStrength.skilledLabour', e.target.value)}
                                            className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded text-sm font-bold"
                                        >
                                            <option value="0">0</option>
                                            <option value="1-10">1-10</option>
                                            <option value="11-30">11-30</option>
                                            <option value="31-50">31-50</option>
                                            <option value="50+">50+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FleetTab({ fleet, onChange }: any) {
    const addFleet = () => {
        onChange([...fleet, {
            id: Math.random().toString(),
            workType: '',
            machines: []
        }])
    }

    const updateFleet = (idx: number, field: string, value: any) => {
        const updated = [...fleet]
        updated[idx][field] = value
        onChange(updated)
    }

    const addMachine = (idx: number) => {
        const updated = [...fleet]
        updated[idx].machines.push({ machineType: '', deployableRange: '1', source: 'OWNED' })
        onChange(updated)
    }

    const updateMachine = (idx: number, mIdx: number, field: string, value: any) => {
        const updated = [...fleet]
        updated[idx].machines[mIdx][field] = value
        onChange(updated)
    }

    const removeFleet = (idx: number) => onChange(fleet.filter((_: any, i: number) => i !== idx))

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 border border-blue-100">
                <Truck size={20} className="shrink-0" />
                <p className="text-sm">
                    <strong>Deployable Assets:</strong> Focus on what you can *mobilize*, not just what you own.
                </p>
            </div>
            <div className="flex justify-end">
                <button onClick={addFleet} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
                    <Plus size={16} /> Add Machinery Group
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {fleet.map((group: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative group">
                        <button onClick={() => removeFleet(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>

                        <div className="mb-4 max-w-sm">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">For Work Type</label>
                            <input
                                placeholder="e.g. Earthworks"
                                className="w-full p-2 bg-white border border-slate-200 rounded-lg"
                                value={group.workType}
                                onChange={(e) => updateFleet(idx, 'workType', e.target.value)}
                            />
                        </div>

                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Machines List</div>
                        <div className="space-y-2">
                            {group.machines?.map((m: any, mIdx: number) => (
                                <div key={mIdx} className="flex gap-2 items-center">
                                    <input
                                        className="flex-1 p-2 border border-slate-200 rounded text-sm"
                                        placeholder="Machine Type (e.g. Piling Rig)"
                                        value={m.machineType}
                                        onChange={(e) => updateMachine(idx, mIdx, 'machineType', e.target.value)}
                                    />
                                    <select
                                        className="w-32 p-2 border border-slate-200 rounded text-sm"
                                        value={m.deployableRange}
                                        onChange={(e) => updateMachine(idx, mIdx, 'deployableRange', e.target.value)}
                                    >
                                        <option value="1">1 Unit</option>
                                        <option value="2-3">2-3 Units</option>
                                        <option value="4-6">4-6 Units</option>
                                        <option value="7+">7+ Units</option>
                                    </select>
                                    <select
                                        className="w-32 p-2 border border-slate-200 rounded text-sm font-bold text-slate-600"
                                        value={m.source}
                                        onChange={(e) => updateMachine(idx, mIdx, 'source', e.target.value)}
                                    >
                                        <option value="OWNED">Owned</option>
                                        <option value="RENTED">Rented</option>
                                        <option value="MIXED">Mixed</option>
                                    </select>
                                </div>
                            ))}
                            <button onClick={() => addMachine(idx)} className="text-blue-600 text-xs font-bold hover:underline">+ Add Machine</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TrustTab({ scores }: any) {
    return (
        <div className="max-w-4xl mx-auto text-center space-y-8 py-12">
            <div>
                <ShieldCheck size={64} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">System Trust Score</h2>
                <p className="text-slate-500 max-w-lg mx-auto mt-2">
                    This score is generated automatically based on your actual performance on the platform.
                    It cannot be edited.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                <TrustCard label="Projects In System" value={scores.projectsInSystem || 0} />
                <TrustCard label="Sections Completed" value={scores.sectionsCompleted || 0} />
                <TrustCard label="Avg Delay (Days)" value={scores.avgDelayDays || 0} sub="0 is perfect" color="text-red-500" />
                <TrustCard label="Quality Rating" value={scores.avgRating || '-'} sub="out of 5.0" color="text-yellow-500" />
            </div>
        </div>
    )
}

function TrustCard({ label, value, sub, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-slate-400 text-xs font-bold uppercase mb-2">{label}</div>
            <div className={`text-4xl font-bold ${color || 'text-slate-800'}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
        </div>
    )
}

function InputGroup({ label, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
            />
        </div>
    )
}
