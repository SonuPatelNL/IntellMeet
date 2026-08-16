import request from 'supertest';
import app from '../../app';
import User from '../users/user.model';
import { AuthService } from './auth.service';

jest.mock('../users/user.model');
jest.mock('./auth.service');

describe('Auth Endpoints Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const mockUser = {
        _id: 'userid123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
      (AuthService.hashPassword as jest.Mock).mockResolvedValue('hashedpassword');
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (AuthService.generateAccessToken as jest.Mock).mockReturnValue('access_token');
      (AuthService.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'securePassword123',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined(); // Sets cookies
    });

    it('should fail registration with invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
        });

      expect(response.status).toBe(400); // Validation error
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user and return cookies', async () => {
      const mockUser = {
        _id: 'userid123',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
      };

      // Mock chainable findOne().select()
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });
      
      (AuthService.comparePassword as jest.Mock).mockResolvedValue(true);
      (AuthService.generateAccessToken as jest.Mock).mockReturnValue('access_token');
      (AuthService.generateRefreshToken as jest.Mock).mockReturnValue('refresh_token');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'securePassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});
