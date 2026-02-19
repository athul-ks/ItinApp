import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock @logtail/node
// We define the mock functions outside so we can assert on them
const flushMock = vi.fn().mockResolvedValue(undefined);
const infoMock = vi.fn();
const errorMock = vi.fn();
const warnMock = vi.fn();
const debugMock = vi.fn();

vi.mock('@logtail/node', () => {
  return {
    Logtail: vi.fn().mockImplementation(function() {
      return {
        info: infoMock,
        error: errorMock,
        warn: warnMock,
        debug: debugMock,
        flush: flushMock,
      };
    }),
  };
});

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Reset env mock for each test to ensure clean state
    vi.doMock('@itinapp/env', () => ({ env: { LOGTAIL_SOURCE_TOKEN: undefined } }));
  });

  describe('normalizeError', () => {
    it('should normalize an Error object', async () => {
      vi.doMock('@itinapp/env', () => ({ env: { LOGTAIL_SOURCE_TOKEN: undefined } }));

      const { normalizeError } = await import('../logger');
      const error = new Error('Test error');
      const normalized = normalizeError(error);
      expect(normalized).toEqual({
        message: 'Test error',
        stack: error.stack,
      });
    });

    it('should normalize a non-Error object', async () => {
      vi.doMock('@itinapp/env', () => ({ env: { LOGTAIL_SOURCE_TOKEN: undefined } }));

      const { normalizeError } = await import('../logger');
      const error = 'Something went wrong';
      const normalized = normalizeError(error);
      expect(normalized).toEqual({
        message: 'Something went wrong',
      });
    });
  });

  describe('initialization', () => {
    it('should initialize Logtail when LOGTAIL_SOURCE_TOKEN is present', async () => {
      vi.doMock('@itinapp/env', () => ({
        env: {
          LOGTAIL_SOURCE_TOKEN: 'fake-token',
        },
      }));

      const { logger } = await import('../logger');
      const { Logtail } = await import('@logtail/node');

      expect(Logtail).toHaveBeenCalledWith('fake-token');
      // The logger object should use the mocks
      logger.info('test');
      expect(infoMock).toHaveBeenCalledWith('test');
    });

    it('should initialize fallback logger when LOGTAIL_SOURCE_TOKEN is missing', async () => {
      vi.doMock('@itinapp/env', () => ({
        env: {
          LOGTAIL_SOURCE_TOKEN: undefined,
        },
      }));

      const { logger } = await import('../logger');
      const { Logtail } = await import('@logtail/node');

      expect(Logtail).not.toHaveBeenCalled();
      expect(logger).toHaveProperty('info');
      expect(logger.info).toBe(console.log);
    });

    it('should have a no-op flush method on fallback logger', async () => {
      vi.doMock('@itinapp/env', () => ({
        env: {
          LOGTAIL_SOURCE_TOKEN: undefined,
        },
      }));

      const { logger } = await import('../logger');
      // @ts-ignore
      await expect(logger.flush()).resolves.toBeUndefined();
    });
  });

  describe('flushLogs', () => {
    it('should flush logs if Logtail is used', async () => {
      vi.doMock('@itinapp/env', () => ({
        env: {
          LOGTAIL_SOURCE_TOKEN: 'fake-token',
        },
      }));

      const { flushLogs } = await import('../logger');
      await flushLogs();
      expect(flushMock).toHaveBeenCalled();
    });

    it('should do nothing if fallback logger is used', async () => {
      vi.doMock('@itinapp/env', () => ({
        env: {
          LOGTAIL_SOURCE_TOKEN: undefined,
        },
      }));

      const { flushLogs } = await import('../logger');

      await expect(flushLogs()).resolves.not.toThrow();

      expect(flushMock).not.toHaveBeenCalled();
    });
  });
});
