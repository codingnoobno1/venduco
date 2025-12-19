// Model Index - Export all models
// Core Models
export { User, RegistrationStatus, UserRole, type IUser } from './User'
export { Project, ProjectStatus, type IProject } from './Project'
export { Task, TaskPriority, TaskStatus, type ITask } from './Task'
export { Vendor, type IVendor } from './Vendor'
export { InventoryItem, type IInventoryItem } from './InventoryItem'

// Machine & Equipment
export { Machine, MachineType, MachineStatus, type IMachine } from './Machine'
export { MachineAssignment, type IMachineAssignment } from './MachineAssignment'
export { Maintenance, MaintenanceType, MaintenanceStatus, type IMaintenance } from './Maintenance'
export { MachineRental, RentalStatus, type IMachineRental } from './MachineRental'

// Location & Geo
export { Location, EntityType, type ILocation } from './Location'
export { GeoFence, GeoFenceType, GeoFenceShape, type IGeoFence } from './GeoFence'

// Project Management
export { ProjectMember, MemberRole, type IProjectMember } from './ProjectMember'
export { Milestone, MilestoneStatus, type IMilestone } from './Milestone'
export { DailyReport, ReportStatus, type IDailyReport } from './DailyReport'
export { WorkLog, WorkLogType, type IWorkLog } from './WorkLog'

// Bidding
export { Bid, BidStatus, BidderType, type IBid } from './Bid'

// Communication
export { ChatMessage, type IChatMessage } from './ChatMessage'
export { Announcement, AnnouncementScope, AnnouncementPriority, type IAnnouncement } from './Announcement'
export { Notification, NotificationType, NotificationPriority, type INotification } from './Notification'

// System
export { AuditLog, AuditAction, type IAuditLog } from './AuditLog'

