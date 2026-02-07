import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, ADMIN_COOKIE_CONFIG } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const sessionToken = validateAdminPassword(password);

    if (sessionToken) {
      const response = NextResponse.json({ success: true });

      // Set the cookie via NextResponse
      response.cookies.set(
        ADMIN_COOKIE_CONFIG.name,
        sessionToken,
        ADMIN_COOKIE_CONFIG.options
      );

      return response;
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
