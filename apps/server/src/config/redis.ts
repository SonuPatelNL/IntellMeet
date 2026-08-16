import { Redis } from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.redisUrl, {
  retryStrategy: (times) => {
    // Reconnect after
    return Math.min(times * 50, 2000);
  },
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});
