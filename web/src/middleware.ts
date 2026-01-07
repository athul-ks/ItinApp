import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // "authorized" is the logic function. 
    // If it returns true, the user sees the page. 
    // If false, they are redirected to login.
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;

      // If user is logged in, let them go anywhere.
      if (token) return true;

      // If user is NOT logged in, ONLY allow the Home Page.
      if (pathname === "/") {
        return true;
      }

      // Block everything else (redirects to login)
      return false;
    },
  },
  pages: {
    signIn: "/api/auth/signin", // Default NextAuth sign-in page
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
