import { JWT } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

export const authLogic = ({ req, token }: { req: NextRequest; token: JWT | null }) => {
  const pathname = req.nextUrl.pathname;

  // If user is logged in, let them go anywhere.
  if (token) return true;

  // If user is NOT logged in, ONLY allow the Home Page.
  if (pathname === '/') {
    return true;
  }

  // Block everything else
  return false;
};

export default withAuth({
  callbacks: {
    // "authorized" is the logic function.
    // If it returns true, the user sees the page.
    // If false, they are redirected to login.
    authorized: authLogic,
  },
  pages: {
    signIn: '/?auth=login',
  },
});

// "matcher" tells Next.js which routes to run this middleware on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (so auth endpoints still work!)
     * - static files (_next/static, _next/image)
     * - favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
