import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_CONFIG } from '@/lib/admin/auth';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear the cookie by setting it with maxAge 0
    response.cookies.set(ADMIN_COOKIE_CONFIG.name, '', {
      ...ADMIN_COOKIE_CONFIG.options,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
