"use client"

import React from 'react'
import { Building2, MapPin, Users, Calendar } from 'lucide-react'

export function CompanyInfoMock() {
    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Drafting Company Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Company Name</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">BuildIT Global Corp</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Base Location</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Silicon Valley, CA</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Team Strength</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">1,200+ Specialists</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Years Active</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">18 Years</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
