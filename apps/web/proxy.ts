import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/super-admin', '/pos', '/kds', '/onboarding'];
const authPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('dinepos_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. User is not authenticated but tries to access a protected path
  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (!token && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. User is authenticated but tries to access login/register
  const isAuthPath = authPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|monitoring|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
