import { env } from './env';

let config = env;

switch (env.nodeEnv) {
  case 'production':
    config = { ...env, debug: false, logLevel: process.env.LOG_LEVEL || 'info' };
    break;
  case 'staging':
    config = { ...env, debug: false, logLevel: process.env.LOG_LEVEL || 'info' };
    break;
  default:
    config = { ...env, debug: true, logLevel: process.env.LOG_LEVEL || 'debug' };
}

export { config };
