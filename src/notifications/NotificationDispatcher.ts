import { Notification, DeliveryResult, UserPreferences } from './types';
import { NotificationChannel } from './NotificationChannel';
import { EmailChannel } from './EmailChannel';
import { WebhookChannel } from './WebhookChannel';
import { logger } from '../shared/Logger';

export class NotificationDispatcher {
  private channels: Map<string, NotificationChannel>;

  constructor() {
    this.channels = new Map();
    this.channels.set('email', new EmailChannel());
    this.channels.set('webhook', new WebhookChannel());
  }

  async dispatch(
    notification: Notification,
    preferences: UserPreferences,
    recipientEmail: string
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    if (preferences.emailEnabled) {
      const emailChannel = this.channels.get('email');
      if (emailChannel) {
        const result = await emailChannel.send(notification, recipientEmail);
        results.push(result);
      }
    }

    if (preferences.webhooksEnabled) {
      const webhookChannel = this.channels.get('webhook');
      if (webhookChannel) {
        const result = await webhookChannel.send(notification, notification.userId);
        results.push(result);
      }
    }

    // TODO: Add in-app notification support

    logger.info('Notification dispatched', {
      notificationId: notification.id,
      channelCount: results.length
    });

    return results;
  }
}
