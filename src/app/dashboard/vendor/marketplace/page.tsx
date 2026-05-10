'use client'

import React, { useState } from 'react'
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
    Briefcase
} from 'lucide-react'

export default function VendorMarketplacePage() {
    const [activeCategory, setActiveCategory] = useState<'all' | 'labour' | 'machines' | 'materials'>('all')

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-white/10 p-8 md:p-12">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Discover. Hire. <span className="text-blue-500">Scale.</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        The ultimate infrastructure marketplace. Find verified labour, rent heavy machinery, and source materials from trusted vendors.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="What are you looking for? (e.g. 20 Helpers, JCB, Welding Machine)" 
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-500 transition-all shadow-2xl"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                            Search Marketplace
                        </button>
                    </div>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
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
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'bg-[#111] text-gray-400 border border-white/5 hover:border-white/20'
                        }`}
                    >
                        <cat.icon size={18} />
                        {cat.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-gray-500 text-sm">
                    <Filter size={18} />
                    <span>Advanced Filters</span>
                </div>
            </div>

            {/* Urgent Hiring Feed */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold">Urgent Hiring Feed</h2>
                    </div>
                    <button className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:underline">
                        View All Urgent Requests <ChevronRight size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Need 25 Helpers Today', location: 'Thane West', wage: '₹950', duration: 'Immediate', tags: ['URGENT', 'CASH_DAILY'] },
                        { title: 'Experienced JCB Operator', location: 'Navi Mumbai', wage: '₹1200', duration: '3 Months', tags: ['OPERATOR', 'METRO'] },
                        { title: '15 Masons for Highway', location: 'Pune Bypass', wage: '₹1100', duration: '6 Months', tags: ['LONG_TERM'] },
                    ].map((job, i) => (
                        <div key={i} className="bg-[#111] border border-orange-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-orange-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    {job.tags.map(t => (
                                        <span key={t} className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-0.5 rounded-md font-bold">{t}</span>
                                    ))}
                                </div>
                                <ArrowUpRight className="text-gray-600 group-hover:text-orange-500 transition-colors" size={20} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{job.title}</h3>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin size={14} /> {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Zap size={14} /> {job.wage} / Day • {job.duration}
                                </div>
                            </div>
                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition-all">
                                Submit Bid / Apply
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Regions</h4>
                        <div className="space-y-2">
                            {['Mumbai', 'Thane', 'Navi Mumbai', 'Pune', 'Nashik'].map(city => (
                                <label key={city} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="w-5 h-5 rounded border border-white/10 bg-[#111] flex items-center justify-center group-hover:border-blue-500">
                                        <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0 group-checked:opacity-100" />
                                    </div>
                                    <span className="text-gray-400 group-hover:text-white transition-colors">{city}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4">Rating</h4>
                        <div className="space-y-2">
                            {[5, 4, 3].map(star => (
                                <div key={star} className="flex items-center gap-2 text-yellow-500 cursor-pointer hover:opacity-80">
                                    <div className="flex gap-0.5">
                                        {[...Array(star)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <span className="text-gray-400 text-sm">& Up</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Featured Vendors & Supply</h2>
                        <span className="text-gray-500 text-sm">Showing 142 results</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
                                <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                                    <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-blue-600 border-4 border-[#111] flex items-center justify-center text-xl font-black">AI</div>
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-white/10">
                                        <ShieldCheck size={12} className="text-blue-400" /> VERIFIED
                                    </div>
                                </div>
                                <div className="p-6 pt-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">Apex Infra Solutions</h3>
                                        <div className="flex items-center gap-3">
                                            <button className="text-gray-600 hover:text-red-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="text-white text-sm font-bold">4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-2">Specialized in heavy earthmoving and tunnel manpower.</p>
                                    <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold mb-4">
                                        <Navigation size={12} /> 2.4 km away
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-1 rounded-md">150+ WORKERS</span>
                                        <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-1 rounded-md">8 MACHINES</span>
                                        <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-1 rounded-md">GST VERIFIED</span>
                                    </div>

                                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                                        <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                            <MessageSquare size={16} /> Chat
                                        </button>
                                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                            View Profile <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
