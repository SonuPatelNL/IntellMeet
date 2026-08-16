import Redis from 'ioredis';
import { env } from '../config/env';

const redis = new Redis(env.redisUrl);

redis.on('error', (err) => {
  // Logging intentionally minimal here; logger may not be initialized yet
  // eslint-disable-next-line no-console
  console.error('Redis error', err.message || err);
});

export default redis;
