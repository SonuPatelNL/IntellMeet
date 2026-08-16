import request from 'supertest';
import { Types } from 'mongoose';
import app from '../../app';
import Notification from './notification.model';
import NotificationPreferences from './preferences.model';
import { AuthService } from '../auth/auth.service';

jest.mock('./notification.model');
jest.mock('./preferences.model');
jest.mock('../auth/auth.service');

describe('Notification Endpoints Integration', () => {
  const mockToken = 'mock_access_token';
  const mockUserPayload = { userId: 'userid123', role: 'user' };

  beforeEach(() => {
    (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockUserPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return notification history for the current user', async () => {
    const notificationId = new Types.ObjectId().toString();

    (Notification.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([
        {
          _id: notificationId,
          recipientId: 'userid123',
          message: 'You were mentioned in a meeting',
          type: 'mention',
          isRead: false,
        },
      ]),
    });
    (Notification.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.unreadCount).toBe(1);
  });

  it('should mark a notification as read', async () => {
    const notificationId = new Types.ObjectId().toString();

    (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: notificationId,
      recipientId: 'userid123',
      isRead: true,
    });

    const response = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.notification.isRead).toBe(true);
  });

  it('should update notification preferences', async () => {
    const preferences = {
      userId: 'userid123',
      meetingInvite: false,
      meetingReminder: true,
      taskAssigned: true,
      mention: true,
      aiTaskAssigned: true,
      save: jest.fn().mockResolvedValue(true),
    };

    (NotificationPreferences.findOne as jest.Mock).mockResolvedValue(preferences);

    const response = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ meetingInvite: false });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.preferences.meetingInvite).toBe(false);
  });
});
