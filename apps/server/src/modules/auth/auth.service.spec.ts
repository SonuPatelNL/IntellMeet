import { AuthService } from './auth.service';
import { Types } from 'mongoose';
import { env } from '../../config/env';

// Basic mock tests (will run with Jest or Vitest later)
describe('AuthService', () => {
  it('should hash and verify a password', async () => {
    const password = 'mySuperSecretPassword123';
    const hash = await AuthService.hashPassword(password);
    
    expect(hash).not.toBe(password);
    
    const isValid = await AuthService.comparePassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await AuthService.comparePassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate and verify an access token', () => {
    const userId = new Types.ObjectId();
    const token = AuthService.generateAccessToken(userId, 'user');
    
    expect(token).toBeDefined();

    const payload = AuthService.verifyAccessToken(token);
    expect(payload.userId).toBe(userId.toString());
    expect(payload.role).toBe('user');
  });
});
