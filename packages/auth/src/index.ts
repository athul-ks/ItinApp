import { getServerSession } from 'next-auth';

import { authOptions } from './auth-options';

// Export the options so the API route can use them
export { authOptions } from './auth-options';

// Helper: Use this in tRPC routers or Server Components to get the logged-in user
export const getServerAuthSession = () => getServerSession(authOptions);
