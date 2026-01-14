import { NextResponse, type NextRequest } from 'next/server';

// Define public paths that do not require authentication
const publicPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // Check if user is on a public path
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If user has a session and is on a public page, redirect to dashboard
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // The AppLayout will handle protecting private routes.
  // We allow the request to proceed, and the layout will check for a valid token.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
