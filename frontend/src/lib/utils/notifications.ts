/**
 * Browser notifications utility for todo reminders
 */

export class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<number, NodeJS.Timeout> = new Map();

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification immediately
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Schedule a notification for a specific time
   */
  scheduleNotification(
    todoId: number,
    title: string,
    dueDate: string,
    reminderMinutesBefore: number = 15
  ): void {
    // Clear existing notification for this todo
    this.cancelNotification(todoId);

    const dueDateTime = new Date(dueDate).getTime();
    const reminderTime = dueDateTime - reminderMinutesBefore * 60 * 1000;
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) {
      // Due date has passed or is very soon
      return;
    }

    const timeoutId = setTimeout(() => {
      this.showNotification('Todo Reminder', {
        body: `"${title}" is due in ${reminderMinutesBefore} minutes`,
        tag: `todo-${todoId}`,
        requireInteraction: true,
      });
      this.scheduledNotifications.delete(todoId);
    }, delay);

    this.scheduledNotifications.set(todoId, timeoutId);
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(todoId: number): void {
    const timeoutId = this.scheduledNotifications.get(todoId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(todoId);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }
}

export const notificationManager = NotificationManager.getInstance();
