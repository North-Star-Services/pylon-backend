import { UserPreferences } from '../notifications/types';

export class UserService {
  private preferences: Map<string, UserPreferences> = new Map();
  private emails: Map<string, string> = new Map();

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    return this.preferences.get(userId) || null;
  }

  async getEmail(userId: string): Promise<string | null> {
    return this.emails.get(userId) || null;
  }

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    const existing = this.preferences.get(userId) || {
      userId,
      emailEnabled: true,
      inAppEnabled: true,
      webhooksEnabled: true
    };
    this.preferences.set(userId, { ...existing, ...prefs });
  }

  registerUser(userId: string, email: string, preferences: UserPreferences): void {
    this.emails.set(userId, email);
    this.preferences.set(userId, preferences);
  }
}
