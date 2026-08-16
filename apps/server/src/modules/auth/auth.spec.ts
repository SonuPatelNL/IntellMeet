import { AuthService } from './auth.service';
import { User, UserRole } from '../users/user.model';
import { redis } from '../../config';

// Mock dependencies
jest.mock('../users/user.model');
jest.mock('../../config', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
  },
  redis: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if the user already exists', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'test@example.com' });

      // Act & Assert
      await expect(
        AuthService.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: UserRole.MEMBER,
        })
      ).rejects.toThrow('Email is already registered.');
    });

    it('should successfully register a user and return tokens', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockSetPassword = jest.fn();
      const mockToJSON = jest.fn().mockReturnValue({
        _id: 'mock-user-id',
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.MEMBER,
      });

      // Mock user constructor
      (User as unknown as jest.Mock).mockImplementation(() => ({
        _id: 'mock-user-id',
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.MEMBER,
        setPassword: mockSetPassword,
        save: mockSave,
        toJSON: mockToJSON,
      }));

      // Act
      const result = await AuthService.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
        role: UserRole.MEMBER,
      });

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'new@example.com' });
      expect(mockSetPassword).toHaveBeenCalledWith('Password123!');
      expect(mockSave).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('new@example.com');
    });
  });

  describe('login', () => {
    it('should throw an unauthorized error if user is not found', async () => {
      // Arrange
      const chainableSelect = { select: jest.fn().mockResolvedValue(null) };
      (User.findOne as jest.Mock).mockReturnValue(chainableSelect);

      // Act & Assert
      await expect(
        AuthService.login({
          email: 'notfound@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Invalid email or password.');
    });
  });
});
