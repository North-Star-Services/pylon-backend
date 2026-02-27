import { Notification, DeliveryResult } from './types';
import { NotificationChannel } from './NotificationChannel';
import { WebhookSubscriptionRepository } from '../webhooks/WebhookSubscriptionRepository';
import { AxiosHttpClient } from '../shared/HttpClient';
import { logger } from '../shared/Logger';
import crypto from 'crypto';

export class WebhookChannel implements NotificationChannel {
  readonly name = 'webhook';
  private subscriptionRepo: WebhookSubscriptionRepository;
  private httpClient: AxiosHttpClient;

  constructor() {
    this.subscriptionRepo = new WebhookSubscriptionRepository();
    this.httpClient = new AxiosHttpClient();
  }

  async send(notification: Notification, userId: string): Promise<DeliveryResult> {
    const subscriptions = await this.subscriptionRepo.findByUserIdAndEventType(
      userId,
      notification.eventType
    );

    if (subscriptions.length === 0) {
      return {
        notificationId: notification.id,
        channel: this.name,
        success: true,
        deliveredAt: new Date()
      };
    }

    const subscription = subscriptions[0];

    return this.deliverToSubscription(notification, subscription.url, subscription.secret);
  }

  private async deliverToSubscription(
    notification: Notification,
    url: string,
    secret: string
  ): Promise<DeliveryResult> {
    const payload = this.buildPayload(
      notification.id,
      notification.eventType,
      notification.userId,
      notification.payload,
      notification.createdAt
    );
    const signature = this.signPayload(payload, secret);

    let attempts = 0;

    while (attempts < 3) {
      try {
        const response = await this.httpClient.post(
          url,
          payload,
          {
            'Content-Type': 'application/json',
            'X-Pylon-Signature': signature,
            'X-Pylon-Event': notification.eventType
          }
        );

        if (response.status < 500) {
          logger.info('Webhook delivered', {
            notificationId: notification.id,
            url,
            status: response.status
          });

          return {
            notificationId: notification.id,
            channel: this.name,
            success: true,
            deliveredAt: new Date()
          };
        }

        attempts++;
        if (attempts < 3) {
          await this.delay(2000 * attempts);
        }
      } catch (error) {
        logger.error('Webhook delivery error', {
          notificationId: notification.id,
          url,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        attempts++;
        if (attempts < 3) {
          await this.delay(2000 * attempts);
        }
      }
    }

    logger.info('Webhook delivery completed', { notificationId: notification.id });

    return {
      notificationId: notification.id,
      channel: this.name,
      success: true,
      deliveredAt: new Date()
    };
  }

  private buildPayload(
    notificationId: string,
    eventType: string,
    userId: string,
    payload: Record<string, unknown>,
    createdAt: Date
  ): Record<string, unknown> {
    return {
      id: notificationId,
      eventType: eventType,
      userId: userId,
      payload: payload,
      timestamp: createdAt.toISOString()
    };
  }

  private signPayload(payload: Record<string, unknown>, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
