import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
);

const SESSION_COOKIE = 'luxe-session';
const ADMIN_SESSION_COOKIE = 'luxe-admin-session';



async function verifyEdgeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 1. Handle CORS Preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }



  // 3. Admin Routes Protection: /admin/*
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthPage = pathname === '/admin/login' || pathname === '/admin/dang-ky';

    if (isAuthPage) {
      if (adminToken) {
        const payload = await verifyEdgeToken(adminToken);
        if (payload && payload.type === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
    } else {
      if (!adminToken) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const payload = await verifyEdgeToken(adminToken);
      if (!payload || payload.type !== 'admin') {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete(ADMIN_SESSION_COOKIE);
        return response;
      }
    }
  }

  // 4. Customer Account Protection: /tai-khoan/*
  if (pathname.startsWith('/tai-khoan')) {
    const userToken = request.cookies.get(SESSION_COOKIE)?.value;

    if (!userToken) {
      const loginUrl = new URL('/dang-nhap', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyEdgeToken(userToken);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/dang-nhap', request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  }

  // 5. Auth Pages (Login/Register) redirect to /tai-khoan if already authenticated
  if (pathname === '/dang-nhap' || pathname === '/dang-ky') {
    const userToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (userToken) {
      const payload = await verifyEdgeToken(userToken);
      if (payload) {
        return NextResponse.redirect(new URL('/tai-khoan', request.url));
      }
    }
  }

  // 6. Build response with security headers
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );


  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images folder)
     * - uploads/ (uploaded media files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
};
