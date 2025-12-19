// Daily Summary API - Auto-generated at day lock
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { verifyToken, unauthorizedResponse } from '@/lib/auth'
import { Task, Project } from '@/models'
import mongoose from 'mongoose'

const DayLock = mongoose.models.DayLock
const Attendance = mongoose.models.Attendance
const Issue = mongoose.models.Issue
const MaterialRequest = mongoose.models.MaterialRequest

// Default labour rates
const LABOUR_RATES = { skilled: 800, unskilled: 500 }

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ date: string }> }
) {
    try {
        const payload = verifyToken(request)
        if (!payload) return unauthorizedResponse()

        await dbConnect()
        const { date: dateStr } = await context.params

        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')

        const date = new Date(dateStr)
        date.setHours(0, 0, 0, 0)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        // Get project info
        const project = projectId ? await Project.findById(projectId).lean() : null

        // Check if day is locked
        let isLocked = false
        let lockData = null
        if (DayLock) {
            lockData = await DayLock.findOne({
                projectId,
                date: { $gte: date, $lt: nextDay }
            }).lean()
            isLocked = !!lockData
        }

        // Get attendance for the day
        let attendance = { skilledCount: 0, unskilledCount: 0, shift: 'DAY', labourCost: 0 }
        if (Attendance) {
            const att = await Attendance.findOne({
                projectId,
                date: { $gte: date, $lt: nextDay }
            }).lean() as any

            if (att) {
                const shiftMultiplier = att.shift === 'DOUBLE' ? 2 : 1
                attendance = {
                    skilledCount: att.skilledCount || 0,
                    unskilledCount: att.unskilledCount || 0,
                    shift: att.shift || 'DAY',
                    labourCost: ((att.skilledCount || 0) * LABOUR_RATES.skilled +
                        (att.unskilledCount || 0) * LABOUR_RATES.unskilled) * shiftMultiplier
                }
            }
        }

        // Get tasks progress for the day
        const tasks = await Task.find({
            projectId,
            $or: [
                { updatedAt: { $gte: date, $lt: nextDay } },
                { completedAt: { $gte: date, $lt: nextDay } }
            ]
        }).lean()

        const tasksCompleted = tasks.filter((t: any) => t.progress >= 100).length
        const tasksSummary = tasks.map((t: any) => ({
            title: t.title,
            progress: t.progress || 0,
            status: t.status,
        }))

        // Get issues for the day
        let issues = { raised: 0, resolved: 0, open: 0, list: [] as any[] }
        if (Issue) {
            const dayIssues = await Issue.find({
                projectId,
                createdAt: { $gte: date, $lt: nextDay }
            }).lean()

            const resolvedIssues = await Issue.find({
                projectId,
                resolvedAt: { $gte: date, $lt: nextDay }
            }).lean()

            const openIssues = await Issue.countDocuments({
                projectId,
                status: { $in: ['OPEN', 'IN_PROGRESS'] }
            })

            issues = {
                raised: dayIssues.length,
                resolved: resolvedIssues.length,
                open: openIssues,
                list: dayIssues.slice(0, 5).map((i: any) => ({
                    title: i.title,
                    priority: i.priority,
                    status: i.status
                })),
            }
        }

        // Get material orders for the day
        let materials = { ordered: 0, totalCost: 0, list: [] as any[] }
        if (MaterialRequest) {
            const dayMaterials = await MaterialRequest.find({
                projectId,
                createdAt: { $gte: date, $lt: nextDay }
            }).lean()

            const approvedToday = await MaterialRequest.find({
                projectId,
                status: 'APPROVED',
                updatedAt: { $gte: date, $lt: nextDay }
            }).lean()

            materials = {
                ordered: dayMaterials.length,
                totalCost: approvedToday.reduce((sum: number, m: any) => sum + (m.selectedQuote?.totalPrice || 0), 0),
                list: dayMaterials.slice(0, 5).map((m: any) => ({
                    name: m.materialName,
                    quantity: m.quantity,
                    unit: m.unit,
                    status: m.status,
                })),
            }
        }

        // Generate text summary (replaces WhatsApp paragraph)
        const totalWorkers = attendance.skilledCount + attendance.unskilledCount
        const textSummary = `
📅 **Daily Summary - ${date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}**
${project ? `📍 Project: ${(project as any).name}` : ''}

👷 **Labour**: ${totalWorkers} workers (${attendance.skilledCount}S + ${attendance.unskilledCount}U) - ${attendance.shift} shift
💰 **Labour Cost**: ₹${attendance.labourCost.toLocaleString()}

📋 **Tasks**: ${tasksCompleted}/${tasks.length} completed
${tasksSummary.slice(0, 3).map(t => `  • ${t.title}: ${t.progress}%`).join('\n')}

⚠️ **Issues**: ${issues.raised} raised, ${issues.resolved} resolved, ${issues.open} open

📦 **Materials**: ${materials.ordered} ordered, ₹${materials.totalCost.toLocaleString()} approved

${isLocked ? '🔒 **Day Locked**' : '⏳ Day not yet locked'}
        `.trim()

        return NextResponse.json({
            success: true,
            data: {
                date: date.toISOString(),
                projectId,
                projectName: (project as any)?.name,
                isLocked,
                lockedAt: (lockData as any)?.lockedAt,
                attendance,
                tasks: {
                    total: tasks.length,
                    completed: tasksCompleted,
                    list: tasksSummary,
                },
                issues,
                materials,
                totalDayCost: attendance.labourCost + materials.totalCost,
                textSummary,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'SERVER_ERROR', message: error.message },
            { status: 500 }
        )
    }
}
