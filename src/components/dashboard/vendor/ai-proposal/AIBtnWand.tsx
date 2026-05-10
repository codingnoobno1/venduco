"use client"

import React from 'react'
import { Sparkles, Wand2 } from 'lucide-react'

export function AIBtnWand({ onClick, children, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-white shadow-xl hover:shadow-blue-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="uppercase tracking-widest">{children}</span>
                <Wand2 className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
            </div>
        </button>
    )
}
