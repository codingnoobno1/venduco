// Bidding system showcase component
"use client"

import { motion } from "framer-motion"
import { Clock, Users, TrendingUp } from "lucide-react"

const activeBids = [
    { id: 1, project: "Metro Line 7 - Civil Works", bids: 23, closing: "2 days", trend: "up" },
    { id: 2, project: "Airport Runway Extension", bids: 18, closing: "5 days", trend: "up" },
    { id: 3, project: "Highway Tunnel Construction", bids: 31, closing: "1 day", trend: "hot" },
]

export function BiddingSystemShowcase() {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    🎯 Smart Bidding System
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Real-time competitive bidding for infrastructure projects
                </p>
            </div>

            <div className="grid gap-4">
                {activeBids.map((bid, index) => (
                    <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                                    {bid.project}
                                </h3>

                                <div className="flex gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span className="text-slate-600 dark:text-slate-400">
                                            <strong className="text-blue-600 font-semibold">{bid.bids}</strong> Bids
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Closes in <strong className="text-orange-600">{bid.closing}</strong>
                                        </span>
                                    </div>

                                    {bid.trend === "hot" && (
                                        <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                                            <TrendingUp className="w-3 h-3 text-red-600" />
                                            <span className="text-xs font-semibold text-red-600">HOT</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5">
                                Place Bid
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 text-center">
                <button className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    View All Active Tenders →
                </button>
            </div>
        </div>
    )
}
