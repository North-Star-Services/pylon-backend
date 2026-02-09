import { WebhookChannel } from '../../src/notifications/WebhookChannel';
import { Notification } from '../../src/notifications/types';

jest.mock('../../src/webhooks/WebhookSubscriptionRepository', () => ({
  WebhookSubscriptionRepository: jest.fn().mockImplementation(() => ({
    findByUserIdAndEventType: jest.fn().mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        url: 'https://example.com/webhook',
        eventTypes: ['order.completed'],
        secret: 'test-secret',
        isActive: true,
        createdAt: new Date()
      }
    ])
  }))
}));

jest.mock('../../src/shared/HttpClient', () => ({
  AxiosHttpClient: jest.fn().mockImplementation(() => ({
    post: jest.fn().mockResolvedValue({ status: 200, data: {}, headers: {} })
  }))
}));

describe('WebhookChannel', () => {
  let channel: WebhookChannel;

  beforeEach(() => {
    jest.clearAllMocks();
    channel = new WebhookChannel();
  });

  it('should implement NotificationChannel interface', () => {
    expect(channel.name).toBe('webhook');
    expect(typeof channel.send).toBe('function');
  });

  it('should deliver webhook successfully', async () => {
    const notification: Notification = {
      id: 'notif-1',
      userId: 'user-1',
      eventType: 'order.completed',
      payload: { orderId: '12345' },
      createdAt: new Date()
    };

    const result = await channel.send(notification, 'user-1');

    expect(result.success).toBe(true);
    expect(result.channel).toBe('webhook');
  });

  it('should return success when no subscriptions exist', async () => {
    const { WebhookSubscriptionRepository } = require('../../src/webhooks/WebhookSubscriptionRepository');
    WebhookSubscriptionRepository.mockImplementation(() => ({
      findByUserIdAndEventType: jest.fn().mockResolvedValue([])
    }));

    const newChannel = new WebhookChannel();
    const notification: Notification = {
      id: 'notif-2',
      userId: 'user-2',
      eventType: 'order.completed',
      payload: {},
      createdAt: new Date()
    };

    const result = await newChannel.send(notification, 'user-2');

    expect(result.success).toBe(true);
  });
});
