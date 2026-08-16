import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';

export const getHealthStatus = async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = redis.status === 'ready' ? 'connected' : redis.status;

  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    services: {
      server: 'running',
      database: mongoStatus,
      cache: redisStatus,
    },
  });
};
