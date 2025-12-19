// Enhanced PM Chat Page with Mentions, Read Receipts, and Announcements
"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Send,
    Paperclip,
    Pin,
    MessageSquare,
    Users,
    Check,
    CheckCheck,
    AtSign,
    Bell,
    X,
} from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/shared/LoadingSkeleton'
import { StatusBadge } from '@/components/dashboard/shared/StatusBadge'

export default function PMChatPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [showMentions, setShowMentions] = useState(false)
    const [mentionFilter, setMentionFilter] = useState('')
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({ text: '', expiresAt: '' })
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchMessages(selectedProject._id)
            fetchAnnouncements(selectedProject._id)
            fetchTeamMembers(selectedProject._id)
            // Mark messages as read
            markAsRead(selectedProject._id)
        }
    }, [selectedProject])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    async function fetchProjects() {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/projects/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setProjects(data.data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchMessages(projectId: string) {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/chat/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            const msgs = data?.data?.messages || data?.data || []
            setMessages(Array.isArray(msgs) ? msgs : [])
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            setMessages([])
        }
    }

    async function fetchAnnouncements(projectId: string) {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/chat/${projectId}/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setAnnouncements(data.data || [])
        } catch (error) {
            console.error('Failed to fetch announcements:', error)
        }
    }

    async function fetchTeamMembers(projectId: string) {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setTeamMembers(data.data || [])
        } catch (error) {
            console.error('Failed to fetch team:', error)
        }
    }

    async function markAsRead(projectId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/chat/${projectId}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    async function sendMessage() {
        if (!newMessage.trim() || !selectedProject) return

        const token = localStorage.getItem('token')

        // Extract mentions from message
        const mentionRegex = /@(\w+)/g
        const mentions = [...newMessage.matchAll(mentionRegex)].map(m => m[1])

        try {
            await fetch(`/api/chat/${selectedProject._id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: newMessage,
                    mentions
                })
            })
            setNewMessage('')
            fetchMessages(selectedProject._id)
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    async function createAnnouncement() {
        if (!newAnnouncement.text.trim() || !selectedProject) return

        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/chat/${selectedProject._id}/announcements`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAnnouncement)
            })
            setShowAnnouncementModal(false)
            setNewAnnouncement({ text: '', expiresAt: '' })
            fetchAnnouncements(selectedProject._id)
        } catch (error) {
            console.error('Failed to create announcement:', error)
        }
    }

    async function unpinAnnouncement(announcementId: string) {
        const token = localStorage.getItem('token')
        try {
            await fetch(`/api/chat/${selectedProject._id}/announcements/${announcementId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchAnnouncements(selectedProject._id)
        } catch (error) {
            console.error('Failed to unpin:', error)
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setNewMessage(value)

        // Check for @ mentions
        const lastWord = value.split(' ').pop() || ''
        if (lastWord.startsWith('@')) {
            setShowMentions(true)
            setMentionFilter(lastWord.slice(1).toLowerCase())
        } else {
            setShowMentions(false)
        }
    }

    function insertMention(member: any) {
        const words = newMessage.split(' ')
        words.pop()
        words.push(`@${member.name?.split(' ')[0] || member.role}`)
        setNewMessage(words.join(' ') + ' ')
        setShowMentions(false)
        inputRef.current?.focus()
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    function renderMessageWithMentions(text: string) {
        return text.split(/(@\w+)/g).map((part, idx) => {
            if (part.startsWith('@')) {
                return (
                    <span key={idx} className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1 rounded font-medium">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    const filteredMembers = teamMembers.filter(m =>
        m.name?.toLowerCase().includes(mentionFilter) ||
        m.role?.toLowerCase().includes(mentionFilter)
    )

    if (loading) {
        return <LoadingSkeleton type="card" count={3} />
    }

    return (
        <div className="h-[calc(100vh-200px)] flex gap-4">
            {/* Project List */}
            <div className="w-80 bg-white dark:bg-slate-800 rounded-xl border flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Project Chats</h2>
                </div>
                <div className="flex-1 overflow-auto">
                    {projects.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">No projects</div>
                    ) : (
                        projects.map((project) => (
                            <button
                                key={project._id}
                                onClick={() => setSelectedProject(project)}
                                className={`w-full p-4 text-left border-b hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedProject?._id === project._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <p className="font-medium truncate">{project.name}</p>
                                    {project.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                            {project.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">{project.projectCode}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border flex flex-col">
                {selectedProject ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{selectedProject.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Users size={12} />
                                    {teamMembers.length} members
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAnnouncementModal(true)}
                                className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg text-sm font-medium flex items-center gap-1"
                            >
                                <Pin size={14} />
                                Pin Announcement
                            </motion.button>
                        </div>

                        {/* Pinned Announcements */}
                        {announcements.length > 0 && (
                            <div className="border-b bg-amber-50 dark:bg-amber-900/20">
                                {announcements.map((ann) => (
                                    <div key={ann._id} className="p-3 flex items-start justify-between border-b border-amber-200 dark:border-amber-800 last:border-0">
                                        <div className="flex gap-2">
                                            <Bell className="text-amber-600 shrink-0" size={16} />
                                            <div>
                                                <p className="text-sm">{renderMessageWithMentions(ann.text)}</p>
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Pinned by {ann.pinnedByName} • {ann.expiresAt && `Expires ${new Date(ann.expiresAt).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => unpinAnnouncement(ann._id)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-400" />
                                        <p>No messages yet</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl p-3 ${msg.isOwn
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-slate-100 dark:bg-slate-700 rounded-bl-sm'
                                            }`}>
                                            {!msg.isOwn && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        {msg.senderName}
                                                    </p>
                                                    <StatusBadge status={msg.senderRole} />
                                                </div>
                                            )}
                                            <p className="text-sm">{renderMessageWithMentions(msg.message)}</p>
                                            <div className={`flex items-center gap-1 justify-end mt-1 ${msg.isOwn ? 'text-blue-200' : 'text-slate-400'
                                                }`}>
                                                <span className="text-xs">
                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.isOwn && (
                                                    msg.readBy?.length > 0 ? (
                                                        <CheckCheck size={14} className="text-blue-300" />
                                                    ) : (
                                                        <Check size={14} />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input with Mentions */}
                        <div className="p-4 border-t relative">
                            {/* Mentions Dropdown */}
                            {showMentions && filteredMembers.length > 0 && (
                                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border rounded-lg shadow-lg max-h-40 overflow-auto">
                                    {filteredMembers.slice(0, 5).map((member) => (
                                        <button
                                            key={member._id || member.userId}
                                            onClick={() => insertMention(member)}
                                            className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                        >
                                            <AtSign size={14} className="text-blue-500" />
                                            <span className="font-medium">{member.name}</span>
                                            <StatusBadge status={member.role} />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <Paperclip size={20} className="text-slate-400" />
                                </button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message... Use @name to mention"
                                    className="flex-1 px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </motion.button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <MessageSquare size={64} className="mx-auto mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold mb-2">Select a project</h3>
                            <p>Choose a project from the list to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full"
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Pin className="text-orange-500" />
                                Pin Announcement
                            </h2>
                            <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Announcement *</label>
                                <textarea
                                    value={newAnnouncement.text}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, text: e.target.value })}
                                    rows={3}
                                    placeholder="e.g., We need 10 pillars for mass erection by tomorrow!"
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                                <p className="text-xs text-slate-500 mt-1">Use @vendor or @supervisor to mention roles</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Expires On (optional)</label>
                                <input
                                    type="date"
                                    value={newAnnouncement.expiresAt}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button
                                    onClick={createAnnouncement}
                                    disabled={!newAnnouncement.text.trim()}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Pin size={18} />
                                    Pin
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
