"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageSquare, Sparkles, Wand2 } from 'lucide-react'
import Image from 'next/image'

export function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your Venduco Copilot. I've analyzed the MCF tender and I'm ready to help you optimize this proposal." },
        { role: 'ai', content: "Would you like me to refine the Commercial BOQ or double-check the Technical Compliance?" }
    ])

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <Image
                                        src="/copilot.png"
                                        alt="Copilot"
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Venduco Copilot</h4>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online & Ready</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${m.role === 'ai'
                                            ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            : 'bg-blue-600 text-white'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2">
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full font-bold border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" /> Fix Commercial Errors
                                    </button>
                                    <button className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full font-bold border border-purple-100 dark:border-purple-800 hover:bg-purple-100 transition-colors flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Reword Tone
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ask Copilot something..."
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                                <button className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 relative group overflow-hidden ${isOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
                    }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? (
                    <X className="w-8 h-8 relative z-10" />
                ) : (
                    <div className="flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10">
                            <Image
                                src="/copilot.png"
                                alt="Copilot"
                                width={32}
                                height={32}
                                className="object-contain drop-shadow-lg"
                            />
                        </div>
                    </div>
                )}
            </motion.button>
        </div>
    )
}
