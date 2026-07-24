import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('dinepos_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/' ||
    pathname === '/demo' ||
    pathname.startsWith('/menu') ||
    pathname.startsWith('/partners') ||
    pathname === '/subscribe' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/support' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico');

  // 1. Unauthenticated users: redirect to /login if they try to access protected pages
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Keep track of the original page to redirect back post-login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Allow visiting /login or /register freely so users can view login or switch accounts

  // 3. Super Admin Workspace Protection
  if (token && pathname.startsWith('/super-admin')) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));

      if (decoded.role !== 'SUPER_ADMIN') {
        // Unauthorized role for Super Admin panel -> redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - monitoring (Sentry, etc.)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json & sw.js
     * - images & static assets
     */
    '/((?!api|monitoring|_next/static|_next/image|favicon.ico|manifest.json|sw.js|images|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico|.*\\.json).*)',
  ],
};
