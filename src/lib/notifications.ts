import dbConnect from './db';
import { Notification } from '@/models/Notification';

export type NotificationType =
  | 'JOB_POSTED'
  | 'APPLICATION_RECEIVED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'PAYMENT_ESCROWED'
  | 'PAYMENT_RELEASED'
  | 'ATTENDANCE_FLAGGED'
  | 'TEAM_JOINED'
  | 'TEAM_LEFT'
  | 'SYSTEM';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function createNotification(payload: NotificationPayload): Promise<void> {
  await dbConnect();
  await Notification.create({
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.body,
    data: payload.data ?? {},
    isRead: false,
  });
}

export async function createBulkNotifications(payloads: NotificationPayload[]): Promise<void> {
  if (payloads.length === 0) return;
  await dbConnect();
  await Notification.insertMany(
    payloads.map(p => ({
      userId: p.userId,
      type: p.type,
      title: p.title,
      message: p.body,
      data: p.data ?? {},
      isRead: false,
    }))
  );
}
