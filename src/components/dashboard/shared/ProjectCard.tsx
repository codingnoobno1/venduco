// ProjectCard Component - Display project summary
"use client"

import { motion } from 'framer-motion'
import { MapPin, Users, Calendar, TrendingUp } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

interface ProjectCardProps {
    project: {
        _id: string
        name: string
        projectCode?: string
        location?: string
        status: string
        progress?: number
        deadline?: string
        vendorsCount?: number
        supervisorsCount?: number
    }
    onClick?: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                    {project.projectCode && (
                        <p className="text-sm text-slate-500">{project.projectCode}</p>
                    )}
                </div>
                <StatusBadge status={project.status} />
            </div>

            {project.location && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                </div>
            )}

            {/* Progress Bar */}
            {typeof project.progress === 'number' && (
                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{(project.vendorsCount || 0) + (project.supervisorsCount || 0)}</span>
                    </div>
                    {project.deadline && (
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
