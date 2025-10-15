import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /entries route
  if (request.nextUrl.pathname.startsWith('/entries')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="MSQ Survey Dashboard"',
        },
      });
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Check credentials (admin / m$q$urv3y)
    if (username !== 'admin' || password !== 'm$q$urv3y') {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="MSQ Survey Dashboard"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/entries/:path*',
};
