import request from 'supertest';
import app from '../../app';
import Meeting from './meeting.model';
import { AuthService } from '../auth/auth.service';

jest.mock('./meeting.model');
jest.mock('../auth/auth.service');

describe('Meeting Endpoints Integration', () => {
  const mockToken = 'mock_access_token';
  const mockUserPayload = { userId: 'userid123', role: 'user' };

  beforeEach(() => {
    (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockUserPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/meetings/instant', () => {
    it('should successfully create an instant meeting', async () => {
      const mockMeeting = {
        _id: 'meetingid123',
        title: 'Adhoc Sync',
        hostId: 'userid123',
        status: 'active',
        startTime: new Date(),
        attendees: ['userid123'],
      };

      (Meeting.create as jest.Mock).mockResolvedValue(mockMeeting);

      const response = await request(app)
        .post('/api/v1/meetings/instant')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Adhoc Sync',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.meeting).toBeDefined();
      expect(response.body.data.meeting.status).toBe('active');
    });

    it('should fail if authorization is missing', async () => {
      // Temporarily override token verification to throw
      (AuthService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/v1/meetings/instant')
        .send({ title: 'Unauthorized Call' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/meetings/schedule', () => {
    it('should schedule a meeting for a future date', async () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 2);

      const mockMeeting = {
        _id: 'meetingid123',
        title: 'Weekly Standup',
        hostId: 'userid123',
        status: 'scheduled',
        startTime: futureTime.toISOString(),
      };

      (Meeting.create as jest.Mock).mockResolvedValue(mockMeeting);

      const response = await request(app)
        .post('/api/v1/meetings/schedule')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          title: 'Weekly Standup',
          startTime: futureTime.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.meeting.status).toBe('scheduled');
    });
  });
});
