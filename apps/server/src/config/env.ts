import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') }); // Or standard root .env

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/intellmeet',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  passwordHashIterations: parseInt(process.env.PASSWORD_HASH_ITERATIONS || '100000', 10),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  sentryDsn: process.env.SENTRY_DSN || '',
};

const requiredSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

if (env.nodeEnv === 'production') {
  requiredSecrets.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  });
}
