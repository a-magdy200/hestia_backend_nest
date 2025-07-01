/**
 * Notification mock data for MSW
 * Provides realistic notification data for development and testing
 */

import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
} from '../../interfaces/enums/notification.enum';

/**
 * Mock notification data
 */
export const mockNotificationData = {
  /**
   * Get notifications response
   */
  getNotifications: {
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.SYSTEM,
        title: 'Welcome to Hestia!',
        message: "Welcome to the Hestia platform. We're excited to have you on board!",
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.READ,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        metadata: {
          category: 'welcome',
          actionUrl: '/dashboard',
          actionText: 'Get Started',
        },
        sentAt: '2024-12-28T10:00:00Z',
        deliveredAt: '2024-12-28T10:00:01Z',
        readAt: '2024-12-28T10:05:00Z',
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:05:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.RECIPE,
        title: 'New Recipe Available',
        message: 'A new recipe "Mediterranean Pasta" has been added to your favorites.',
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.DELIVERED,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        metadata: {
          category: 'recipe',
          recipeId: '550e8400-e29b-41d4-a716-446655440100',
          actionUrl: '/recipes/550e8400-e29b-41d4-a716-446655440100',
          actionText: 'View Recipe',
        },
        sentAt: '2024-12-28T14:30:00Z',
        deliveredAt: '2024-12-28T14:30:01Z',
        createdAt: '2024-12-28T14:30:00Z',
        updatedAt: '2024-12-28T14:30:01Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.INGREDIENT,
        title: 'Low Stock Alert',
        message: "You're running low on olive oil. Consider adding it to your shopping list.",
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.PENDING,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        metadata: {
          category: 'inventory',
          ingredientId: '550e8400-e29b-41d4-a716-446655440200',
          actionUrl: '/ingredients/550e8400-e29b-41d4-a716-446655440200',
          actionText: 'View Ingredient',
        },
        createdAt: '2024-12-28T16:00:00Z',
        updatedAt: '2024-12-28T16:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.SHOPPING_LIST,
        title: 'Shopping List Shared',
        message: 'Sarah has shared a shopping list "Weekend BBQ" with you.',
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.SENT,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        metadata: {
          category: 'shopping',
          shoppingListId: '550e8400-e29b-41d4-a716-446655440300',
          senderId: '550e8400-e29b-41d4-a716-446655440011',
          actionUrl: '/shopping-lists/550e8400-e29b-41d4-a716-446655440300',
          actionText: 'View List',
        },
        sentAt: '2024-12-28T18:00:00Z',
        createdAt: '2024-12-28T18:00:00Z',
        updatedAt: '2024-12-28T18:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.SECURITY,
        title: 'Security Alert',
        message:
          "New login detected from a new device. If this wasn't you, please review your account security.",
        priority: NotificationPriority.URGENT,
        status: NotificationStatus.DELIVERED,
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        metadata: {
          category: 'security',
          deviceInfo: {
            browser: 'Chrome',
            os: 'Windows',
            location: 'New York, NY',
            ip: '192.168.1.100',
          },
          actionUrl: '/account/security',
          actionText: 'Review Security',
        },
        sentAt: '2024-12-28T20:00:00Z',
        deliveredAt: '2024-12-28T20:00:01Z',
        createdAt: '2024-12-28T20:00:00Z',
        updatedAt: '2024-12-28T20:00:01Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.REMINDER,
        title: 'Meal Planning Reminder',
        message: "Don't forget to plan your meals for next week!",
        priority: NotificationPriority.LOW,
        status: NotificationStatus.SCHEDULED,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        metadata: {
          category: 'reminder',
          scheduledFor: '2024-12-29T09:00:00Z',
          actionUrl: '/meal-planning',
          actionText: 'Plan Meals',
        },
        scheduledAt: '2024-12-29T09:00:00Z',
        createdAt: '2024-12-28T21:00:00Z',
        updatedAt: '2024-12-28T21:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.USER,
        title: 'Profile Update',
        message: 'Your profile has been successfully updated.',
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.READ,
        channels: [NotificationChannel.IN_APP],
        metadata: {
          category: 'profile',
          actionUrl: '/profile',
          actionText: 'View Profile',
        },
        sentAt: '2024-12-28T22:00:00Z',
        deliveredAt: '2024-12-28T22:00:01Z',
        readAt: '2024-12-28T22:01:00Z',
        createdAt: '2024-12-28T22:00:00Z',
        updatedAt: '2024-12-28T22:01:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        userId: '550e8400-e29b-41d4-a716-446655440010',
        type: NotificationType.SYSTEM,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.',
        priority: NotificationPriority.NORMAL,
        status: NotificationStatus.FAILED,
        channels: [NotificationChannel.EMAIL],
        metadata: {
          category: 'maintenance',
          maintenanceWindow: {
            start: '2024-12-29T02:00:00Z',
            end: '2024-12-29T04:00:00Z',
          },
          actionUrl: '/status',
          actionText: 'View Status',
        },
        sentAt: '2024-12-28T23:00:00Z',
        errorMessage: 'Email delivery failed: Invalid email address',
        deliveryAttempts: 3,
        createdAt: '2024-12-28T23:00:00Z',
        updatedAt: '2024-12-28T23:00:00Z',
      },
    ],
  },

  /**
   * Get notification templates response
   */
  getTemplates: {
    data: [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        name: 'Welcome Email',
        type: NotificationType.SYSTEM,
        subject: 'Welcome to Hestia!',
        body: "Hi {{firstName}},\n\nWelcome to Hestia! We're excited to have you on board.\n\nGet started by exploring our features:\n- Create your first recipe\n- Set up your ingredient inventory\n- Plan your shopping lists\n\nBest regards,\nThe Hestia Team",
        variables: ['firstName'],
        isActive: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        name: 'Password Reset',
        type: NotificationType.SECURITY,
        subject: 'Reset Your Password',
        body: "Hi {{firstName}},\n\nYou requested a password reset. Click the link below to reset your password:\n\n{{resetLink}}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Hestia Team",
        variables: ['firstName', 'resetLink'],
        isActive: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        name: 'Recipe Shared',
        type: NotificationType.RECIPE,
        subject: 'Recipe Shared with You',
        body: 'Hi {{firstName}},\n\n{{senderName}} has shared a recipe "{{recipeName}}" with you.\n\n{{recipeDescription}}\n\nView the recipe: {{recipeLink}}\n\nBest regards,\nThe Hestia Team',
        variables: ['firstName', 'senderName', 'recipeName', 'recipeDescription', 'recipeLink'],
        isActive: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        name: 'Low Stock Alert',
        type: NotificationType.INGREDIENT,
        subject: 'Low Stock Alert',
        body: "Hi {{firstName}},\n\nYou're running low on {{ingredientName}}.\n\nCurrent stock: {{currentStock}} {{unit}}\nRecommended stock: {{recommendedStock}} {{unit}}\n\nAdd to shopping list: {{shoppingListLink}}\n\nBest regards,\nThe Hestia Team",
        variables: [
          'firstName',
          'ingredientName',
          'currentStock',
          'unit',
          'recommendedStock',
          'shoppingListLink',
        ],
        isActive: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440105',
        name: 'Security Alert',
        type: NotificationType.SECURITY,
        subject: 'Security Alert - New Login',
        body: "Hi {{firstName}},\n\nWe detected a new login to your account.\n\nDevice: {{device}}\nLocation: {{location}}\nTime: {{loginTime}}\nIP Address: {{ipAddress}}\n\nIf this wasn't you, please review your account security: {{securityLink}}\n\nBest regards,\nThe Hestia Team",
        variables: ['firstName', 'device', 'location', 'loginTime', 'ipAddress', 'securityLink'],
        isActive: true,
        createdAt: '2024-12-28T10:00:00Z',
        updatedAt: '2024-12-28T10:00:00Z',
      },
    ],
  },

  /**
   * Get notification by ID
   */
  getNotificationById: (id: string) => {
    return mockNotificationData.getNotifications.data.find(notification => notification.id === id);
  },

  /**
   * Get template by ID
   */
  getTemplateById: (id: string) => {
    return mockNotificationData.getTemplates.data.find(template => template.id === id);
  },

  /**
   * Create notification success response
   */
  createNotificationSuccess: {
    success: true,
    message: 'Notification created successfully',
    data: {
      id: '550e8400-e29b-41d4-a716-446655440999',
      userId: '550e8400-e29b-41d4-a716-446655440010',
      type: NotificationType.SYSTEM,
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: NotificationPriority.NORMAL,
      status: NotificationStatus.PENDING,
      channels: [NotificationChannel.IN_APP],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },

  /**
   * Create notification failure response
   */
  createNotificationFailure: {
    success: false,
    error: 'Failed to create notification',
    message: 'An error occurred while creating the notification',
  },

  /**
   * Update notification success response
   */
  updateNotificationSuccess: {
    success: true,
    message: 'Notification updated successfully',
  },

  /**
   * Update notification failure response
   */
  updateNotificationFailure: {
    success: false,
    error: 'Failed to update notification',
    message: 'An error occurred while updating the notification',
  },

  /**
   * Delete notification success response
   */
  deleteNotificationSuccess: {
    success: true,
    message: 'Notification deleted successfully',
  },

  /**
   * Delete notification failure response
   */
  deleteNotificationFailure: {
    success: false,
    error: 'Failed to delete notification',
    message: 'An error occurred while deleting the notification',
  },

  /**
   * Mark as read success response
   */
  markAsReadSuccess: {
    success: true,
    message: 'Notification marked as read',
  },

  /**
   * Mark as read failure response
   */
  markAsReadFailure: {
    success: false,
    error: 'Failed to mark notification as read',
    message: 'An error occurred while marking the notification as read',
  },

  /**
   * Bulk notification success response
   */
  bulkNotificationSuccess: {
    success: true,
    message: 'Bulk notification sent successfully',
    data: {
      batchId: '550e8400-e29b-41d4-a716-446655440999',
      totalSent: 5,
      succeeded: 5,
      failed: 0,
    },
  },

  /**
   * Bulk notification failure response
   */
  bulkNotificationFailure: {
    success: false,
    error: 'Failed to send bulk notification',
    message: 'An error occurred while sending the bulk notification',
  },

  /**
   * Get preferences success response
   */
  getPreferencesSuccess: {
    success: true,
    data: {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
      types: {
        system: true,
        user: true,
        recipe: true,
        ingredient: false,
        shopping_list: true,
        security: true,
        reminder: false,
        alert: true,
      },
    },
  },

  /**
   * Update preferences success response
   */
  updatePreferencesSuccess: {
    success: true,
    message: 'Notification preferences updated successfully',
  },

  /**
   * Update preferences failure response
   */
  updatePreferencesFailure: {
    success: false,
    error: 'Failed to update preferences',
    message: 'An error occurred while updating notification preferences',
  },

  /**
   * Get statistics success response
   */
  getStatisticsSuccess: {
    success: true,
    data: {
      total: 150,
      unread: 25,
      read: 125,
      byType: {
        system: 30,
        user: 45,
        recipe: 25,
        ingredient: 15,
        shopping_list: 20,
        security: 5,
        reminder: 10,
      },
      byPriority: {
        low: 50,
        normal: 80,
        high: 15,
        urgent: 5,
      },
      byStatus: {
        pending: 10,
        sent: 120,
        delivered: 100,
        read: 125,
        failed: 5,
      },
    },
  },

  /**
   * Get delivery status success response
   */
  getDeliveryStatusSuccess: {
    success: true,
    data: {
      notificationId: '550e8400-e29b-41d4-a716-446655440001',
      status: NotificationStatus.DELIVERED,
      sentAt: '2024-12-28T10:00:00Z',
      deliveredAt: '2024-12-28T10:00:01Z',
      readAt: '2024-12-28T10:05:00Z',
      deliveryAttempts: 1,
      errorMessage: null,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    },
  },

  /**
   * Retry notification success response
   */
  retryNotificationSuccess: {
    success: true,
    message: 'Notification retry initiated',
  },

  /**
   * Retry notification failure response
   */
  retryNotificationFailure: {
    success: false,
    error: 'Failed to retry notification',
    message: 'An error occurred while retrying the notification',
  },
};
