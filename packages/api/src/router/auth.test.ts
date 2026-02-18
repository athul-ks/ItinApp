import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaClient } from '@itinapp/db';

import { authRouter } from './auth';

let mockDb: DeepMockProxy<PrismaClient>;

describe('authRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = mockDeep<PrismaClient>();
  });

  const createCaller = (sessionUser: { id: string } | null) => {
    return authRouter.createCaller({
      db: mockDb as unknown as PrismaClient,
      session: sessionUser ? { user: sessionUser, expires: '2099-01-01' } : null,
      headers: new Headers(),
    });
  };

  describe('deleteAccount', () => {
    it('should allow an authenticated user to delete their account', async () => {
      const caller = createCaller({ id: 'user_123' });
      mockDb.user.delete.mockResolvedValue({ id: 'user_123' } as any);
      await caller.deleteAccount();
      expect(mockDb.user.delete).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
    });

    it('should throw UNAUTHORIZED if user is not logged in', async () => {
      const caller = createCaller(null);
      await expect(caller.deleteAccount()).rejects.toThrow('UNAUTHORIZED');
      expect(mockDb.user.delete).not.toHaveBeenCalled();
    });
  });
});
