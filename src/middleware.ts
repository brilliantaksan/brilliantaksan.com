import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';

function isAdminRoot(pathname: string) {
  return pathname === '/admin' || pathname === '/admin/';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminSessionToken(token) : null;

  if (isAdminRoot(pathname)) {
    if (!session) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = '/admin/studio';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*']
};
