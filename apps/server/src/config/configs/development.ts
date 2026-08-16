import { env } from '../env';

export const config = {
  ...env,
  debug: true,
  logLevel: process.env.LOG_LEVEL || 'debug',
};
