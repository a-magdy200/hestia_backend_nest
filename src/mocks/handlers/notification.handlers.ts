/**
 * Notification handlers for MSW
 * Mocks notification endpoints for development and testing
 * Covers comprehensive notification system for Phase 1
 */

import { http, HttpResponse } from 'msw';

import { mockNotificationData } from '../data/notification.data';

/**
 * Request body interfaces for type safety
 */
interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  scheduledAt?: string;
  actionUrl?: string;
  actionText?: string;
}

interface UpdateNotificationRequest {
  title?: string;
  message?: string;
  priority?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface BulkNotificationRequest {
  userIds: string[];
  type: string;
  title: string;
  message: string;
  priority?: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
}

interface NotificationPreferencesRequest {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  quietHours?: {
    enabled: boolean;
    startTime?: string;
    endTime?: string;
  };
  types?: Record<string, boolean>;
}

/**
 * Notification handlers
 * Provides mock responses for notification endpoints
 */
export const notificationHandlers = [
  /**
   * Get user notifications endpoint
   * GET /notifications
   */
  http.get('/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || '';
    const type = url.searchParams.get('type') || '';
    const priority = url.searchParams.get('priority') || '';
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Mock filtering and pagination
    let filteredNotifications = mockNotificationData.getNotifications.data;

    if (status) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.status === status,
      );
    }

    if (type) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.type === type,
      );
    }

    if (priority) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.priority === priority,
      );
    }

    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(notification => !notification.readAt);
    }

    const total = filteredNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 },
    );
  }),

  /**
   * Get notification by ID endpoint
   * GET /notifications/:id
   */
  http.get('/notifications/:id', ({ params }) => {
    const { id } = params;
    const notification = mockNotificationData.getNotificationById(id as string);

    if (!notification) {
      return HttpResponse.json(
        {
          error: 'Notification not found',
          message: 'The requested notification does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(notification, { status: 200 });
  }),

  /**
   * Create notification endpoint
   * POST /notifications
   */
  http.post('/notifications', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateNotificationRequest;
      const { userId, type, title, message } = body;

      // Validate required fields
      if (!userId || !type || !title || !message) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'userId, type, title, and message are required',
          },
          { status: 400 },
        );
      }

      // Validate notification type
      const validTypes = [
        'system',
        'user',
        'recipe',
        'ingredient',
        'shopping_list',
        'security',
        'reminder',
        'alert',
      ];
      if (!validTypes.includes(type)) {
        return HttpResponse.json(
          {
            error: 'Invalid notification type',
            message: `Type must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 },
        );
      }

      const newNotification = {
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        priority: body.priority || 'normal',
        status: 'pending',
        channels: body.channels || ['in_app'],
        metadata: body.metadata || {},
        scheduledAt: body.scheduledAt || null,
        actionUrl: body.actionUrl || null,
        actionText: body.actionText || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          success: true,
          data: newNotification,
          message: 'Notification created successfully',
        },
        { status: 201 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Update notification endpoint
   * PUT /notifications/:id
   */
  http.put('/notifications/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateNotificationRequest;
      const notification = mockNotificationData.getNotificationById(id as string);

      if (!notification) {
        return HttpResponse.json(
          {
            error: 'Notification not found',
            message: 'The requested notification does not exist',
          },
          { status: 404 },
        );
      }

      const updatedNotification = {
        ...notification,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          success: true,
          data: updatedNotification,
          message: 'Notification updated successfully',
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Delete notification endpoint
   * DELETE /notifications/:id
   */
  http.delete('/notifications/:id', ({ params }) => {
    const { id } = params;
    const notification = mockNotificationData.getNotificationById(id as string);

    if (!notification) {
      return HttpResponse.json(
        {
          error: 'Notification not found',
          message: 'The requested notification does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Notification deleted successfully',
      },
      { status: 200 },
    );
  }),

  /**
   * Mark notification as read endpoint
   * PATCH /notifications/:id/read
   */
  http.patch('/notifications/:id/read', ({ params }) => {
    const { id } = params;
    const notification = mockNotificationData.getNotificationById(id as string);

    if (!notification) {
      return HttpResponse.json(
        {
          error: 'Notification not found',
          message: 'The requested notification does not exist',
        },
        { status: 404 },
      );
    }

    const updatedNotification = {
      ...notification,
      status: 'read',
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: updatedNotification,
        message: 'Notification marked as read',
      },
      { status: 200 },
    );
  }),

  /**
   * Mark all notifications as read endpoint
   * PATCH /notifications/read-all
   */
  http.patch('/notifications/read-all', () => {
    return HttpResponse.json(
      {
        success: true,
        message: 'All notifications marked as read',
        data: {
          updatedCount: 15,
        },
      },
      { status: 200 },
    );
  }),

  /**
   * Send bulk notifications endpoint
   * POST /notifications/bulk
   */
  http.post('/notifications/bulk', async ({ request }) => {
    try {
      const body = (await request.json()) as BulkNotificationRequest;
      const { userIds, type, title, message } = body;

      // Validate required fields
      if (!userIds || !type || !title || !message) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'userIds, type, title, and message are required',
          },
          { status: 400 },
        );
      }

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return HttpResponse.json(
          {
            error: 'Invalid user IDs',
            message: 'userIds must be a non-empty array',
          },
          { status: 400 },
        );
      }

      const batchId = crypto.randomUUID();
      const notifications = userIds.map(userId => ({
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        priority: body.priority || 'normal',
        status: 'pending',
        channels: body.channels || ['in_app'],
        metadata: body.metadata || {},
        batchId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return HttpResponse.json(
        {
          success: true,
          data: {
            batchId,
            notifications,
            totalSent: notifications.length,
          },
          message: `Bulk notification sent to ${notifications.length} users`,
        },
        { status: 201 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Get notification statistics endpoint
   * GET /notifications/stats
   */
  http.get('/notifications/stats', () => {
    return HttpResponse.json(
      {
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
      { status: 200 },
    );
  }),

  /**
   * Get user notification preferences endpoint
   * GET /notifications/preferences
   */
  http.get('/notifications/preferences', () => {
    return HttpResponse.json(
      {
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
      { status: 200 },
    );
  }),

  /**
   * Update notification preferences endpoint
   * PUT /notifications/preferences
   */
  http.put('/notifications/preferences', async ({ request }) => {
    try {
      const body = (await request.json()) as NotificationPreferencesRequest;

      const updatedPreferences = {
        email: body.email !== undefined ? body.email : true,
        sms: body.sms !== undefined ? body.sms : false,
        push: body.push !== undefined ? body.push : true,
        inApp: body.inApp !== undefined ? body.inApp : true,
        quietHours: body.quietHours || {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
        types: body.types || {
          system: true,
          user: true,
          recipe: true,
          ingredient: false,
          shopping_list: true,
          security: true,
          reminder: false,
          alert: true,
        },
      };

      return HttpResponse.json(
        {
          success: true,
          data: updatedPreferences,
          message: 'Notification preferences updated successfully',
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Get notification templates endpoint
   * GET /notifications/templates
   */
  http.get('/notifications/templates', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type') || '';

    const templates = mockNotificationData.getTemplates.data;

    let filteredTemplates = templates;
    if (type) {
      filteredTemplates = templates.filter(template => template.type === type);
    }

    const total = filteredTemplates.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedTemplates,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 },
    );
  }),

  /**
   * Get notification template by ID endpoint
   * GET /notifications/templates/:id
   */
  http.get('/notifications/templates/:id', ({ params }) => {
    const { id } = params;
    const template = mockNotificationData.getTemplateById(id as string);

    if (!template) {
      return HttpResponse.json(
        {
          error: 'Template not found',
          message: 'The requested template does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(template, { status: 200 });
  }),

  /**
   * Create notification template endpoint
   * POST /notifications/templates
   */
  http.post('/notifications/templates', async ({ request }) => {
    try {
      const body = await request.json();
      const { name, type, subject, body: templateBody, variables } = body;

      // Validate required fields
      if (!name || !type || !subject || !templateBody) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'name, type, subject, and body are required',
          },
          { status: 400 },
        );
      }

      const newTemplate = {
        id: crypto.randomUUID(),
        name,
        type,
        subject,
        body: templateBody,
        variables: variables || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          success: true,
          data: newTemplate,
          message: 'Template created successfully',
        },
        { status: 201 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Update notification template endpoint
   * PUT /notifications/templates/:id
   */
  http.put('/notifications/templates/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const template = mockNotificationData.getTemplateById(id as string);

      if (!template) {
        return HttpResponse.json(
          {
            error: 'Template not found',
            message: 'The requested template does not exist',
          },
          { status: 404 },
        );
      }

      const updatedTemplate = {
        ...template,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          success: true,
          data: updatedTemplate,
          message: 'Template updated successfully',
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Delete notification template endpoint
   * DELETE /notifications/templates/:id
   */
  http.delete('/notifications/templates/:id', ({ params }) => {
    const { id } = params;
    const template = mockNotificationData.getTemplateById(id as string);

    if (!template) {
      return HttpResponse.json(
        {
          error: 'Template not found',
          message: 'The requested template does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Template deleted successfully',
      },
      { status: 200 },
    );
  }),

  /**
   * Get notification delivery status endpoint
   * GET /notifications/:id/delivery
   */
  http.get('/notifications/:id/delivery', ({ params }) => {
    const { id } = params;
    const notification = mockNotificationData.getNotificationById(id as string);

    if (!notification) {
      return HttpResponse.json(
        {
          error: 'Notification not found',
          message: 'The requested notification does not exist',
        },
        { status: 404 },
      );
    }

    const deliveryStatus = {
      notificationId: id,
      status: notification.status,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      deliveryAttempts: notification.deliveryAttempts || 1,
      errorMessage: notification.errorMessage || null,
      channels: notification.channels,
    };

    return HttpResponse.json(
      {
        success: true,
        data: deliveryStatus,
      },
      { status: 200 },
    );
  }),

  /**
   * Retry failed notification endpoint
   * POST /notifications/:id/retry
   */
  http.post('/notifications/:id/retry', ({ params }) => {
    const { id } = params;
    const notification = mockNotificationData.getNotificationById(id as string);

    if (!notification) {
      return HttpResponse.json(
        {
          error: 'Notification not found',
          message: 'The requested notification does not exist',
        },
        { status: 404 },
      );
    }

    if (notification.status !== 'failed') {
      return HttpResponse.json(
        {
          error: 'Invalid operation',
          message: 'Only failed notifications can be retried',
        },
        { status: 400 },
      );
    }

    const updatedNotification = {
      ...notification,
      status: 'pending',
      deliveryAttempts: (notification.deliveryAttempts || 0) + 1,
      errorMessage: null,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: updatedNotification,
        message: 'Notification retry initiated',
      },
      { status: 200 },
    );
  }),
];
