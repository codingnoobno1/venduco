// MachineCard Component - Display machine info
"use client"

import { motion } from 'framer-motion'
import { Truck, MapPin, Wrench, Clock } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface MachineCardProps {
    machine: {
        _id: string
        name?: string
        machineCode: string
        machineType: string
        status: string
        location?: string
        lastMaintenance?: string
        hoursUsed?: number
    }
    onClick?: () => void
}

const machineIcons: Record<string, string> = {
    TOWER_CRANE: '🏗️',
    EXCAVATOR: '🚜',
    BULLDOZER: '🚧',
    LOADER: '🔄',
    CONCRETE_MIXER: '🪣',
    TRUCK: '🚛',
    DEFAULT: '🔧',
}

export function MachineCard({ machine, onClick }: MachineCardProps) {
    const icon = machineIcons[machine.machineType] || machineIcons.DEFAULT

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {machine.name || machine.machineCode}
                            </h3>
                            <p className="text-sm text-slate-500">{machine.machineType.replace(/_/g, ' ')}</p>
                        </div>
                        <StatusBadge status={machine.status} />
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        {machine.location && (
                            <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span>{machine.location}</span>
                            </div>
                        )}
                        {machine.hoursUsed !== undefined && (
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{machine.hoursUsed}h</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
