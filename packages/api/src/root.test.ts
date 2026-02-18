import { describe, expect, it } from 'vitest';

import { appRouter } from './root';

describe('appRouter (Root)', () => {
  const createCaller = () => {
    return appRouter.createCaller({
      db: {} as any,
      session: null,
      headers: new Headers(),
    });
  };

  describe('hello', () => {
    it('should return "Hello world" when no input is provided', async () => {
      const caller = createCaller();
      const result = await caller.hello();
      expect(result.greeting).toBe('Hello world');
    });

    it('should return "Hello [text]" when input is provided', async () => {
      const caller = createCaller();
      const result = await caller.hello({ text: 'Vitest' });
      expect(result.greeting).toBe('Hello Vitest');
    });
  });
});
