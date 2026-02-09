import { EmailSender } from '../../src/notifications/EmailSender';
import { Notification } from '../../src/notifications/types';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' })
  })
}));

describe('EmailSender', () => {
  let sender: EmailSender;

  beforeEach(() => {
    sender = new EmailSender();
  });

  it('should send email successfully', async () => {
    const notification: Notification = {
      id: 'notif-1',
      userId: 'user-1',
      eventType: 'order.completed',
      payload: { orderId: '12345' },
      createdAt: new Date()
    };

    const result = await sender.send(notification, 'test@example.com');

    expect(result.success).toBe(true);
    expect(result.channel).toBe('email');
  });
});
