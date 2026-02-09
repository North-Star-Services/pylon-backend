import nodemailer from 'nodemailer';
import { Notification, DeliveryResult } from './types';
import { NotificationChannel } from './NotificationChannel';
import { logger } from '../shared/Logger';

export class EmailChannel implements NotificationChannel {
  readonly name = 'email';
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async send(notification: Notification, recipientEmail: string): Promise<DeliveryResult> {
    let attempts = 0;

    while (attempts < 3) {
      try {
        await this.transporter.sendMail({
          from: 'notifications@pylon.internal',
          to: recipientEmail,
          subject: `Notification: ${notification.eventType}`,
          html: this.buildEmailBody(notification)
        });

        logger.info('Email sent successfully', { notificationId: notification.id });

        return {
          notificationId: notification.id,
          channel: this.name,
          success: true,
          deliveredAt: new Date()
        };
      } catch (error) {
        attempts++;
        logger.warn('Email send attempt failed', {
          notificationId: notification.id,
          attempt: attempts,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (attempts < 3) {
          await this.delay(1000 * attempts);
        }
      }
    }

    logger.error('Email delivery failed after retries', { notificationId: notification.id });
    return {
      notificationId: notification.id,
      channel: this.name,
      success: false,
      error: 'Max retries exceeded'
    };
  }

  private buildEmailBody(notification: Notification): string {
    return `
      <h2>${notification.eventType}</h2>
      <p>You have a new notification.</p>
      <pre>${JSON.stringify(notification.payload, null, 2)}</pre>
    `;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
