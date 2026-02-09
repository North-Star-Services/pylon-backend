import { EmailChannel } from '../../src/notifications/EmailChannel';
import { Notification } from '../../src/notifications/types';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' })
  })
}));

describe('EmailChannel', () => {
  let channel: EmailChannel;

  beforeEach(() => {
    channel = new EmailChannel();
  });

  it('should implement NotificationChannel interface', () => {
    expect(channel.name).toBe('email');
    expect(typeof channel.send).toBe('function');
  });

  it('should send email successfully', async () => {
    const notification: Notification = {
      id: 'notif-1',
      userId: 'user-1',
      eventType: 'order.completed',
      payload: { orderId: '12345' },
      createdAt: new Date()
    };

    const result = await channel.send(notification, 'test@example.com');

    expect(result.success).toBe(true);
    expect(result.channel).toBe('email');
    expect(result.notificationId).toBe('notif-1');
  });

  it('should retry on failure', async () => {
    const nodemailer = require('nodemailer');
    const mockSendMail = nodemailer.createTransport().sendMail;

    mockSendMail
      .mockRejectedValueOnce(new Error('Connection timeout'))
      .mockResolvedValueOnce({ messageId: 'test-456' });

    const notification: Notification = {
      id: 'notif-2',
      userId: 'user-1',
      eventType: 'order.completed',
      payload: {},
      createdAt: new Date()
    };

    const result = await channel.send(notification, 'test@example.com');

    expect(result.success).toBe(true);
    expect(mockSendMail).toHaveBeenCalledTimes(2);
  });
});
