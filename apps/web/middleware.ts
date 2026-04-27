import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/') {
    if (token) {
      const user = decodeJwt(token);
      if (user) {
        if (user.role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin', request.url));
        if (user.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (user.role === 'MANAGER') return NextResponse.redirect(new URL('/manager', request.url));
        return NextResponse.redirect(new URL('/engineer', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = decodeJwt(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection
  if (pathname.startsWith('/super-admin') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/manager') && user.role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/engineer') && user.role !== 'ENGINEER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
