import { Notification, DeliveryResult } from './types';

/**
 * Interface for notification delivery channels.
 * Implementations handle the specifics of delivering to each channel type.
 */
export interface NotificationChannel {
  readonly name: string;

  send(notification: Notification, recipient: string): Promise<DeliveryResult>;
}
