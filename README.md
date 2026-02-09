# Pylon Backend

Internal event notification service. Routes events to users via in-app notifications, email, and webhooks.

## Setup

```bash
npm install
npm run build
npm test
```

## Architecture

- `notifications/` - Core notification delivery logic
- `webhooks/` - Webhook subscription management
- `users/` - User preferences and settings
- `shared/` - Common utilities
