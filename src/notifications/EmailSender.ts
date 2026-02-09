import nodemailer from 'nodemailer';
import { Notification, DeliveryResult } from './types';
import { logger } from '../shared/Logger';

export class EmailSender {
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
        channel: 'email',
        success: true,
        deliveredAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to send email', { notificationId: notification.id, error });
      return {
        notificationId: notification.id,
        channel: 'email',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildEmailBody(notification: Notification): string {
    return `
      <h2>${notification.eventType}</h2>
      <p>You have a new notification.</p>
      <pre>${JSON.stringify(notification.payload, null, 2)}</pre>
    `;
  }
}
