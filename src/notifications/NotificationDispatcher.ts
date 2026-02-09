import { Notification, DeliveryResult, UserPreferences } from './types';
import { EmailSender } from './EmailSender';
import { logger } from '../shared/Logger';

export class NotificationDispatcher {
  private emailSender: EmailSender;

  constructor() {
    this.emailSender = new EmailSender();
  }

  async dispatch(
    notification: Notification,
    preferences: UserPreferences,
    recipientEmail: string
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = [];

    if (preferences.emailEnabled) {
      const result = await this.emailSender.send(notification, recipientEmail);
      results.push(result);
    }

    // TODO: Add webhook support
    // TODO: Add in-app notification support

    logger.info('Notification dispatched', {
      notificationId: notification.id,
      channelCount: results.length
    });

    return results;
  }
}
