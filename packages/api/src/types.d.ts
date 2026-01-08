import type { DefaultSession } from 'types';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      credits: number;
    } & DefaultSession['user'];
  }
}
