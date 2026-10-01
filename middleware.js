import { NextResponse } from 'next/server';

// The dashboard shows private family data on an otherwise public site, so it
// sits behind HTTP basic auth. With no DASHBOARD_PASSWORD set it stays locked.
export function middleware(req) {
  const password = process.env.DASHBOARD_PASSWORD;
  const header = req.headers.get('authorization') || '';
  if (password && header.startsWith('Basic ')) {
    const decoded = atob(header.slice(6));
    const supplied = decoded.slice(decoded.indexOf(':') + 1);
    if (supplied === password) return NextResponse.next();
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="To-do dashboard"' },
  });
}

export const config = {
  matcher: ['/dashboard', '/api/dashboard/:path*'],
};
