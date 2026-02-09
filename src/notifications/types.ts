export interface Notification {
  id: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface DeliveryResult {
  notificationId: string;
  channel: string;
  success: boolean;
  error?: string;
  deliveredAt?: Date;
}

export interface UserPreferences {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  webhooksEnabled: boolean;
}
