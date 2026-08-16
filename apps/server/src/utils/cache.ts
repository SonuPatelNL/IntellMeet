import redis from '../config/redisClient';

export const cacheGet = async (key: string) => {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const cacheSet = async (key: string, value: any, ttlSeconds = 60) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (e) {
    // ignore cache errors
  }
};

export const cacheDel = async (key: string) => {
  try {
    await redis.del(key);
  } catch (e) {}
};
