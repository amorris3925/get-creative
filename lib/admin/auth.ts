import { cookies } from 'next/headers';
import { createHash } from 'crypto';

const ADMIN_COOKIE_NAME = 'ic_admin_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Hash the password for comparison
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Verify if the admin is authenticated
export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return false;
    }

    // Verify the session token matches
    const expectedHash = hashPassword(process.env.ADMIN_PASSWORD || '');
    return sessionCookie.value === expectedHash;
  } catch {
    return false;
  }
}

// Validate password and return session token if valid
export function validateAdminPassword(password: string): string | null {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return null;
  }

  if (password !== adminPassword) {
    return null;
  }

  return hashPassword(adminPassword);
}

// Cookie configuration for admin session
// Note: secure is false for sslip.io (HTTP) deployment
// Set COOKIE_SECURE=true when using HTTPS domain
export const ADMIN_COOKIE_CONFIG = {
  name: ADMIN_COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  },
};

