"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, Briefcase, Mountain, Shield, Save, Plus, Trash2 } from 'lucide-react'

export function VendorCapabilityProfile() {
    const [profile, setProfile] = useState<any>(null)
    const [specialisedWorks, setSpecialisedWorks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
        fetchCatalog()
    }, [])

    async function fetchProfile() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/vendors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success && data.data) {
                setProfile(data.data)
            } else {
                // Initialize empty profile
                setProfile({
                    coreDomains: [],
                    terrainExperience: [],
                    specialisations: [],
                    equipmentStrength: [],
                    certifications: [],
                    yearsOfExperience: 0
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchCatalog() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/catalogs/specialised-work', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setSpecialisedWorks(data.data)
        } catch (err) {
            console.error(err)
        }
    }

    async function saveProfile() {
        setSaving(true)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/vendors/profile', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            })
            if (res.ok) {
                alert('Profile saved successfully!')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Capability & Experience Profile</h2>
                    <p className="text-sm text-slate-500">Structured intelligence for strategic project matching</p>
                </div>
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            {/* Core Domains */}
            <motion.div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                        <Briefcase size={20} className="text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg">Core Domains</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['ROADS', 'METRO', 'RAIL', 'TUNNEL', 'BRIDGES', 'HSR'].map(domain => (
                        <button
                            key={domain}
                            onClick={() => {
                                const current = profile.coreDomains || []
                                setProfile({
                                    ...profile,
                                    coreDomains: current.includes(domain)
                                        ? current.filter((d: string) => d !== domain)
                                        : [...current, domain]
                                })
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${profile.coreDomains?.includes(domain)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Terrain Experience */}
            <motion.div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                        <Mountain size={20} className="text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg">Terrain Expertise</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['PLAIN', 'HILLY', 'URBAN_CONGESTED', 'RIVER_CROSSING', 'SOFT_SOIL', 'HARD_ROCK'].map(terrain => (
                        <button
                            key={terrain}
                            onClick={() => {
                                const current = profile.terrainExperience || []
                                setProfile({
                                    ...profile,
                                    terrainExperience: current.includes(terrain)
                                        ? current.filter((t: string) => t !== terrain)
                                        : [...current, terrain]
                                })
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${profile.terrainExperience?.includes(terrain)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {terrain.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Specialized Works */}
            <motion.div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                        <Award size={20} className="text-amber-600" />
                    </div>
                    <h3 className="font-bold text-lg">Specialized Technical Works</h3>
                </div>
                <div className="space-y-2">
                    {specialisedWorks.map(work => {
                        const isSelected = profile.specialisations?.some((s: any) => s.workCode === work.code)
                        return (
                            <div
                                key={work.code}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                                onClick={() => {
                                    const current = profile.specialisations || []
                                    if (isSelected) {
                                        setProfile({
                                            ...profile,
                                            specialisations: current.filter((s: any) => s.workCode !== work.code)
                                        })
                                    } else {
                                        setProfile({
                                            ...profile,
                                            specialisations: [...current, {
                                                workCode: work.code,
                                                experienceLevel: 'BASIC',
                                                evidenceProjects: []
                                            }]
                                        })
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">{work.name}</p>
                                        <p className="text-xs text-slate-500">{work.category} {work.requiresCertification && '• Certification Required'}</p>
                                    </div>
                                    {work.requiresCertification && (
                                        <Shield size={16} className="text-red-500" />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
