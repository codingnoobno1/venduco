// Animated statistics with counting numbers
"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import CountUp from "react-countup"

interface Stat {
    label: string
    value: number
    suffix?: string
    prefix?: string
    icon: string
}

const stats: Stat[] = [
    { label: "Active Tenders", value: 1247, icon: "📋" },
    { label: "Registered Vendors", value: 8430, icon: "🏢", suffix: "+" },
    { label: "Projects Completed", value: 456, icon: "✅" },
    { label: "Total Value", value: 12500, icon: "💰", prefix: "₹", suffix: " Cr" },
]

export function AnimatedStats() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })
    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (isInView) {
            setStarted(true)
        }
    }, [isInView])

    return (
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {started && (
                            <CountUp
                                end={stat.value}
                                duration={2.5}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                            />
                        )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                        {stat.label}
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
