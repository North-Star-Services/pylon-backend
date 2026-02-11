import express from 'express';
import crypto from 'crypto';
import { NotificationDispatcher } from './notifications/NotificationDispatcher';
import { UserService } from './users/UserService';
import { Notification } from './notifications/types';
import { logger } from './shared/Logger';

const app = express();
app.use(express.json());

const userService = new UserService();
const dispatcher = new NotificationDispatcher();

// Seed demo users
userService.registerUser('user-1', 'alice@example.com', {
  userId: 'user-1',
  emailEnabled: true,
  inAppEnabled: true,
  webhooksEnabled: false,
});

userService.registerUser('user-2', 'bob@example.com', {
  userId: 'user-2',
  emailEnabled: true,
  inAppEnabled: false,
  webhooksEnabled: true,
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/notifications', async (req, res) => {
  const { userId, eventType, payload } = req.body;

  if (!userId || !eventType) {
    res.status(400).json({ error: 'userId and eventType are required' });
    return;
  }

  const preferences = await userService.getPreferences(userId);
  if (!preferences) {
    res.status(404).json({ error: `User ${userId} not found` });
    return;
  }

  const email = await userService.getEmail(userId);
  if (!email) {
    res.status(404).json({ error: `No email found for user ${userId}` });
    return;
  }

  const notification: Notification = {
    id: crypto.randomUUID(),
    userId,
    eventType,
    payload: payload || {},
    createdAt: new Date(),
  };

  const results = await dispatcher.dispatch(notification, preferences, email);

  res.json({
    notificationId: notification.id,
    results,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Pylon notification service listening on port ${PORT}`);
});
