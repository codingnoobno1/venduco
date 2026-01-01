"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Award, Shield, TrendingUp, Plus, Trash2, Save } from 'lucide-react'

export function UniversalProfileEditor() {
    const [profile, setProfile] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    async function fetchProfile() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setProfile(data.data)
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
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            })
            if (res.ok) {
                alert('Profile saved successfully!')
                fetchProfile()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    function addExperience() {
        setProfile({
            ...profile,
            experience: [...(profile.experience || []), {
                company: '',
                position: '',
                location: '',
                startDate: new Date(),
                isCurrent: false,
                responsibilities: []
            }]
        })
    }

    function addProjectHistory() {
        setProfile({
            ...profile,
            projectHistory: [...(profile.projectHistory || []), {
                projectName: '',
                client: '',
                role: '',
                projectType: '',
                value: 0,
                duration: 0,
                startDate: new Date(),
                endDate: new Date(),
                outcome: 'COMPLETED',
                delaysInDays: 0,
                ncrCount: 0,
                successRating: 8
            }]
        })
    }

    function addAuthorization() {
        setProfile({
            ...profile,
            authorizations: [...(profile.authorizations || []), {
                type: '',
                scope: '',
                grantedBy: '',
                grantedDate: new Date(),
                isActive: true
            }]
        })
    }

    if (loading) return <div className="p-8 text-center">Loading profile...</div>
    if (!profile) return <div className="p-8 text-center text-red-500">Failed to load profile</div>

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Professional Profile</h1>
                    <p className="text-slate-500 mt-1">Build your credentials and track record</p>
                    <div className="mt-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                                    style={{ width: `${profile.completionPercentage || 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-slate-600">{profile.completionPercentage || 0}%</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {['overview', 'experience', 'projects', 'authorizations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-bold capitalize transition-colors ${activeTab === tab
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4">Professional Summary</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Headline</label>
                                <input
                                    value={profile.headline || ''}
                                    onChange={e => setProfile({ ...profile, headline: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="e.g., Senior Infrastructure PM with 15 years experience"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Bio</label>
                                <textarea
                                    value={profile.bio || ''}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Tell us about your expertise..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    value={profile.yearsOfExperience || 0}
                                    onChange={e => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-600" />
                            Performance Metrics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-blue-600">{profile.performance?.totalProjectsCompleted || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Projects Done</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">{profile.performance?.bidsWon || 0}</p>
                                <p className="text-xs text-slate-500 mt-1">Bids Won</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">{profile.performance?.averageSuccessRating?.toFixed(1) || '0.0'}</p>
                                <p className="text-xs text-slate-500 mt-1">Avg Rating</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-amber-600">₹{((profile.performance?.totalProjectValue || 0) / 10000000).toFixed(1)}Cr</p>
                                <p className="text-xs text-slate-500 mt-1">Total Value</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
                <div className="space-y-4">
                    <button
                        onClick={addExperience}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Experience
                    </button>
                    {(profile.experience || []).map((exp: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={exp.company}
                                    onChange={e => {
                                        const newExp = [...profile.experience]
                                        newExp[idx].company = e.target.value
                                        setProfile({ ...profile, experience: newExp })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Company Name"
                                />
                                <input
                                    value={exp.position}
                                    onChange={e => {
                                        const newExp = [...profile.experience]
                                        newExp[idx].position = e.target.value
                                        setProfile({ ...profile, experience: newExp })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Position"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Project History Tab */}
            {activeTab === 'projects' && (
                <div className="space-y-4">
                    <button
                        onClick={addProjectHistory}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Project
                    </button>
                    {(profile.projectHistory || []).map((proj: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold mb-3">Project {idx + 1}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={proj.projectName}
                                    onChange={e => {
                                        const newProj = [...profile.projectHistory]
                                        newProj[idx].projectName = e.target.value
                                        setProfile({ ...profile, projectHistory: newProj })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Project Name"
                                />
                                <input
                                    value={proj.client}
                                    onChange={e => {
                                        const newProj = [...profile.projectHistory]
                                        newProj[idx].client = e.target.value
                                        setProfile({ ...profile, projectHistory: newProj })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Client"
                                />
                                <input
                                    type="number"
                                    value={proj.value}
                                    onChange={e => {
                                        const newProj = [...profile.projectHistory]
                                        newProj[idx].value = parseFloat(e.target.value)
                                        setProfile({ ...profile, projectHistory: newProj })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Project Value (₹)"
                                />
                                <select
                                    value={proj.outcome}
                                    onChange={e => {
                                        const newProj = [...profile.projectHistory]
                                        newProj[idx].outcome = e.target.value
                                        setProfile({ ...profile, projectHistory: newProj })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                >
                                    <option value="COMPLETED">Completed</option>
                                    <option value="ONGOING">Ongoing</option>
                                    <option value="TERMINATED">Terminated</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Authorizations Tab */}
            {activeTab === 'authorizations' && (
                <div className="space-y-4">
                    <button
                        onClick={addAuthorization}
                        className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Authorization
                    </button>
                    {(profile.authorizations || []).map((auth: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={auth.type}
                                    onChange={e => {
                                        const newAuth = [...profile.authorizations]
                                        newAuth[idx].type = e.target.value
                                        setProfile({ ...profile, authorizations: newAuth })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Authorization Type (e.g., SIGNING_AUTHORITY)"
                                />
                                <input
                                    value={auth.scope}
                                    onChange={e => {
                                        const newAuth = [...profile.authorizations]
                                        newAuth[idx].scope = e.target.value
                                        setProfile({ ...profile, authorizations: newAuth })
                                    }}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                    placeholder="Scope (e.g., Up to ₹50L)"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
