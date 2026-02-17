import { Logtail } from '@logtail/node';

import { env } from '@itinapp/env';

const token = env.LOGTAIL_SOURCE_TOKEN;

export const logger = token
  ? new Logtail(token)
  : {
      // Mock logger for local dev if no token provided
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
      flush: async () => {},
    };

// Helper to flush logs before shutting down (Critical for Serverless/Worker)
export const flushLogs = async () => {
  if (token && 'flush' in logger) {
    await logger.flush();
  }
};

export const normalizeError = (error: unknown): { message: string; stack?: string } => {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
};
