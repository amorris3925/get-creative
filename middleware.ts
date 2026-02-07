import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for login page and API routes
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/login')
  ) {
    return NextResponse.next();
  }

  // Check for admin pages
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('ic_admin_session');

    if (!adminToken) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
