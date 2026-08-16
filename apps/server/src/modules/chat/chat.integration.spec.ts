import request from 'supertest';
import app from '../../app';
import Message from './message.model';
import { AuthService } from '../auth/auth.service';

jest.mock('./message.model');
jest.mock('../auth/auth.service');

describe('Chat Endpoints Integration', () => {
  const mockToken = 'mock_access_token';
  const mockUserPayload = { userId: 'userid123', role: 'user' };

  beforeEach(() => {
    (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockUserPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/chat/history/:roomId', () => {
    it('should successfully retrieve chat logs for a room', async () => {
      const mockMessages = [
        { _id: 'msg1', content: 'Hello', senderId: { name: 'Alice' } },
        { _id: 'msg2', content: 'Hi there', senderId: { name: 'Bob' } },
      ];

      // Mock chainable find().populate().sort()
      const sortMock = jest.fn().mockResolvedValue(mockMessages);
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      (Message.find as jest.Mock).mockReturnValue({ populate: populateMock });

      const response = await request(app)
        .get('/api/v1/chat/history/meetingid123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.messages.length).toBe(2);
      expect(response.body.data.messages[0].content).toBe('Hello');
    });
  });
});
