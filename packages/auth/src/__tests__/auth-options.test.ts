import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { PrismaClient, prisma } from '@itinapp/db';

import { authOptions } from '../auth-options';

vi.mock('@itinapp/db', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

const fetchSpy = vi.fn();
globalThis.fetch = fetchSpy;

const mockDb = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('authOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callbacks.jwt', () => {
    it('should copy user ID to token if user object exists (Sign In)', async () => {
      const jwtCallback = authOptions.callbacks?.jwt!;

      const token = {};
      const user = { id: 'user_123' };

      // @ts-ignore - Partial types for testing
      const result = await jwtCallback({ token, user, account: null });

      expect(result.id).toBe('user_123');
    });

    it('should return token as-is on subsequent calls', async () => {
      const jwtCallback = authOptions.callbacks?.jwt!;
      const token = { id: 'existing_id' };

      // @ts-ignore
      const result = await jwtCallback({ token, user: undefined, account: null });

      expect(result.id).toBe('existing_id');
    });
  });

  describe('callbacks.session', () => {
    it('should fetch fresh credits from DB and attach to session', async () => {
      const sessionCallback = authOptions.callbacks?.session!;

      mockDb.user.findUnique.mockResolvedValue({
        id: 'user_123',
        credits: 50,
      } as any);

      const session = { user: { name: 'Test' } };
      const token = { sub: 'user_123' };

      // @ts-ignore
      const result = await sessionCallback({ session, token, user: null });

      // Verify DB call
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user_123' } });
      // Verify Session Mutation
      expect((result.user as any).id).toBe('user_123');
      expect((result.user as any).credits).toBe(50);
    });

    it('should default to 0 credits if user not found', async () => {
      const sessionCallback = authOptions.callbacks?.session!;

      mockDb.user.findUnique.mockResolvedValue(null);

      const session = { user: { name: 'Test' } };
      const token = { sub: 'user_123' };

      // @ts-ignore
      const result = await sessionCallback({ session, token, user: null });

      expect((result.user as any).credits).toBe(0);
    });
  });

  describe('events.createUser', () => {
    it('should send a webhook to Discord', async () => {
      const createUserEvent = authOptions.events?.createUser!;

      // @ts-ignore
      await createUserEvent({ user: { id: '1' } });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('discord'), // Checks if URL contains 'discord' (from env or default)
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New User Signed Up'),
        })
      );
    });
  });
});
