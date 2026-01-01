// Project Insights Component using MaterialCard
"use client"

import { View, StyleSheet } from 'react-native'
import { MaterialCard } from '@/components/material/material-card'

interface ProjectInsightsProps {
    stats: {
        activeProjects: number
        totalBudget: number
        teamSize: number
        efficiency: number
    }
}

export function ProjectInsights({ stats }: ProjectInsightsProps) {
    return (
        <View style={styles.container}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <MaterialCard
                    title="Active Workstreams"
                    description={`${stats.activeProjects} projects are currently in the execution phase with verified work packages.`}
                    icon="🏗️"
                />
                <MaterialCard
                    title="Financial Overview"
                    description={`Managed budget of ₹${(stats.totalBudget / 10000000).toFixed(1)}Cr across all infrastructure corridors.`}
                    icon="📈"
                />
                <MaterialCard
                    title="Corridor Network"
                    description={`${stats.teamSize} specialized vendors and supervisors currently active in project collaboration.`}
                    icon="🌐"
                />
                <MaterialCard
                    title="Operational Health"
                    description={`Performance rating: ${stats.efficiency}%. Based on reported milestones and audit log activity.`}
                    icon="✨"
                />
            </div>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    }
})
