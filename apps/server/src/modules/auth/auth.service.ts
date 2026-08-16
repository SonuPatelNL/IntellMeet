import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../../config/env';

export interface TokenPayload {
  userId: string;
  role: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(userId: Types.ObjectId | string, role: string): string {
    const payload: TokenPayload = { userId: userId.toString(), role };
    return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiration as any });
  }

  static generateRefreshToken(userId: Types.ObjectId | string, role: string): string {
    const payload: TokenPayload = { userId: userId.toString(), role };
    return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiration as any });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
  }
}
