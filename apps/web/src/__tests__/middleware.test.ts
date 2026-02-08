import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { authLogic } from '@/middleware';

describe('Middleware Auth Logic', () => {
  const createReq = (path: string) =>
    ({
      nextUrl: { pathname: path },
    }) as NextRequest;

  it('allows access to ANY page if user is logged in', () => {
    const req = createReq('/dashboard');
    const token = { name: 'User', sub: '123' };
    const isAuthorized = authLogic({ req, token });
    expect(isAuthorized).toBe(true);
  });

  it('allows access to Home Page even if logged out', () => {
    const req = createReq('/');
    const token = null;
    const isAuthorized = authLogic({ req, token });
    expect(isAuthorized).toBe(true);
  });

  it('BLOCKS access to protected pages if logged out', () => {
    const req = createReq('/dashboard');
    const token = null;
    const isAuthorized = authLogic({ req, token });
    expect(isAuthorized).toBe(false);
  });
});
