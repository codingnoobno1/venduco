'use client'

import React, { useState, useEffect } from 'react'
import { 
    Search, 
    Filter, 
    Truck, 
    Users, 
    Zap, 
    Star, 
    MapPin, 
    TrendingUp,
    ShieldCheck,
    MessageSquare,
    ExternalLink,
    ChevronRight,
    ArrowUpRight,
    Briefcase,
    Heart,
    Navigation
} from 'lucide-react'

export default function VendorMarketplacePage() {
    const [activeCategory, setActiveCategory] = useState<'all' | 'labour' | 'machines' | 'materials'>('all')
    const [jobs, setJobs] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        try {
            // Fetch Urgent Hiring Feed (Jobs)
            const jobsRes = await fetch('/api/mobile/labour/jobs', { headers })
            const jobsData = await jobsRes.json()
            if (jobsData.success) {
                setJobs(jobsData.data || [])
            }

            // Fetch Workers based on active category
            let workersUrl = '/api/vendor/workers?limit=10'
            if (activeCategory === 'labour') {
                workersUrl += '&skill=helper' // Example filter
            } else if (activeCategory === 'machines') {
                // Machines would typically be a different API, but for now we'll fetch workers
                // or just keep the general list
            }
            
            const workersRes = await fetch(workersUrl, { headers })
            const workersData = await workersRes.json()
            if (workersData.success) {
                setVendors(workersData.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch marketplace data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [activeCategory])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500/20 p-8 md:p-12 shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">
                        Discover. Hire. <span className="text-blue-200">Scale.</span>
                    </h1>
                    <p className="text-blue-100 text-lg mb-8">
                        The ultimate infrastructure marketplace. Find verified labour, rent heavy machinery, and source materials from trusted vendors.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
                            <input 
                                type="text" 
                                placeholder="What are you looking for? (e.g. 20 Helpers, JCB, Welding Machine)" 
                                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-blue-200 outline-none focus:bg-white/20 transition-all"
                            />
                        </div>
                        <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold transition-all shadow-lg">
                            Search Marketplace
                        </button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 blur-[120px] rounded-full" />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
                {[
                    { id: 'all', label: 'All Items', icon: Zap },
                    { id: 'labour', label: 'Labour Supply', icon: Users },
                    { id: 'machines', label: 'Heavy Machinery', icon: Truck },
                    { id: 'materials', label: 'Raw Materials', icon: Briefcase },
                ].map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all ${
                            activeCategory === cat.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300'
                        }`}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-slate-500 text-sm cursor-pointer hover:text-blue-600 transition-colors">
                    <Filter size={18} />
                    <span>Advanced Filters</span>
                </div>
            </div>

            {/* Urgent Hiring Feed */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Urgent Hiring Feed</h2>
                    </div>
                    <button className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline">
                        View All Urgent Requests <ChevronRight size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
                        ))
                    ) : jobs.length > 0 ? (
                        jobs.slice(0, 3).map((job, i) => (
                            <div key={job.jobId || i} className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] px-2 py-0.5 rounded-md font-bold">URGENT</span>
                                        {job.accommodation && <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-md font-bold">STAY</span>}
                                    </div>
                                    <ArrowUpRight className="text-slate-300 group-hover:text-orange-500 transition-colors" size={20} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{job.title}</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <MapPin size={14} /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Zap size={14} /> ₹{job.salaryPerDay} / Day • {job.duration}
                                    </div>
                                </div>
                                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200 dark:shadow-none">
                                    Submit Bid / Apply
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500">No urgent hiring requests available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Regions</h4>
                        <div className="space-y-2">
                            {['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'].map(city => (
                                <label key={city} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-5 h-5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center group-hover:border-blue-500">
                                        <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0 group-checked:opacity-100" />
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors">{city}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Rating</h4>
                        <div className="space-y-2">
                            {[5, 4, 3].map(star => (
                                <div key={star} className="flex items-center gap-2 text-yellow-500 cursor-pointer hover:opacity-80">
                                    <div className="flex gap-0.5">
                                        {[...Array(star)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm">& Up</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Featured Vendors & Supply</h2>
                        <span className="text-slate-500 text-sm">Showing 142 results</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl" />
                            ))
                        ) : vendors.length > 0 ? (
                            vendors.map((vendor) => (
                                <div key={vendor._id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group shadow-sm hover:shadow-md">
                                    <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                                        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-blue-600 border-4 border-white dark:border-slate-900 flex items-center justify-center text-xl font-black text-white shadow-lg">
                                            {vendor.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md text-slate-900 dark:text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-slate-200 dark:border-white/10 shadow-sm">
                                            <ShieldCheck size={12} className="text-blue-500" /> {vendor.urgentAvailability === 'AVAILABLE_TODAY' ? 'AVAILABLE' : 'VERIFIED'}
                                        </div>
                                    </div>
                                    <div className="p-6 pt-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{vendor.name}</h3>
                                            <div className="flex items-center gap-3">
                                                <button className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Heart size={20} />
                                                </button>
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star size={16} fill="currentColor" />
                                                    <span className="text-slate-900 dark:text-white text-sm font-bold">{vendor.trustScore ? (vendor.trustScore / 20).toFixed(1) : '4.8'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 line-clamp-2">
                                            {vendor.labourSkills?.join(', ') || 'General Construction Services'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-4">
                                            <Navigation size={12} /> {vendor.city || 'Location N/A'}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-1 rounded-md uppercase">{vendor.labourExperience || 'Experienced'}</span>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-1 rounded-md">ID VERIFIED</span>
                                        </div>

                                        <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                            <button className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                                                <MessageSquare size={16} /> Chat
                                            </button>
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none">
                                                View Profile <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-24 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <Users size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">No featured vendors found</p>
                                <p className="text-slate-400 text-sm">Check back later for verified suppliers</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
