// Modern Hero Section with Animations (No Material Design)
"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"

export function ModernHero() {
    return (
        <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0">
                <motion.div
                    className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-white"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-4 px-4 py-2 bg-blue-500/30 backdrop-blur-md rounded-full border border-blue-400/50"
                        >
                            <span className="text-sm text-blue-200">🚀 Government Infrastructure Platform</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                        >
                            Integrated Coordination for
                            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                                {" "}Infrastructure Corridors
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-blue-100 mb-8 max-w-2xl"
                        >
                            Digital platform for managing vendors, machinery, materials, and daily work execution across
                            national infrastructure projects - Metro, Bullet Trains, Highways & Airports.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                            >
                                Handle Project
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-transparent border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </motion.button>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-12 grid grid-cols-3 gap-8"
                        >
                            {[
                                { value: "1200+", label: "Active Tenders" },
                                { value: "8400+", label: "Vendors" },
                                { value: "₹12.5K Cr", label: "Project Value" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-blue-200">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column - Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative aspect-square max-w-2xl mx-auto">
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src="/images/india-edfc.jpg"
                                    alt="Infrastructure Corridor"
                                    fill
                                    className="object-cover rounded-3xl shadow-2xl"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-3xl" />
                            </motion.div>

                            {/* Floating badges */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl"
                            >
                                <div className="text-2xl mb-1">🚇</div>
                                <div className="text-sm font-semibold">Metro Projects</div>
                                <div className="text-xs text-slate-500">23 Active</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2 }}
                                className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl"
                            >
                                <div className="text-2xl mb-1">🚄</div>
                                <div className="text-sm font-semibold">Bullet Train</div>
                                <div className="text-xs text-slate-500">Delhi-Mumbai HSR</div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
