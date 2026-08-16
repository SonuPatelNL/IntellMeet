// @ts-ignore: optional runtime dependency
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, errors, json } = format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }: any) => {
  const base = { level, message, timestamp: ts, ...meta } as any;
  if (stack) base.stack = stack;
  return JSON.stringify(base);
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'intellmeet-server' },
  transports: [
    new transports.Console({ format: combine(timestamp(), logFormat) }),
  ],
});

export default logger;
