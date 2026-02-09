export interface WebhookSubscription {
  id: string;
  userId: string;
  url: string;
  eventTypes: string[];
  secret: string;
  isActive: boolean;
  createdAt: Date;
}

export class WebhookSubscriptionRepository {
  private subscriptions: Map<string, WebhookSubscription[]> = new Map();

  async findByUserId(userId: string): Promise<WebhookSubscription[]> {
    return this.subscriptions.get(userId) || [];
  }

  async findByUserIdAndEventType(userId: string, eventType: string): Promise<WebhookSubscription[]> {
    const userSubs = await this.findByUserId(userId);
    return userSubs.filter(sub => sub.isActive && sub.eventTypes.includes(eventType));
  }

  async save(subscription: WebhookSubscription): Promise<void> {
    const existing = this.subscriptions.get(subscription.userId) || [];
    existing.push(subscription);
    this.subscriptions.set(subscription.userId, existing);
  }
}
