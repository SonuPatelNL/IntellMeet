import { env } from '../env';

export const config = {
  ...env,
  debug: false,
  logLevel: process.env.LOG_LEVEL || 'info',
};
