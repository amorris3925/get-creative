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

// Login and create session
export async function adminLogin(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return false;
  }

  if (password !== adminPassword) {
    return false;
  }

  try {
    const cookieStore = await cookies();
    const sessionToken = hashPassword(adminPassword);

    cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    });

    return true;
  } catch (err) {
    console.error('Failed to set admin cookie:', err);
    return false;
  }
}

// Logout and clear session
export async function adminLogout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.error('Failed to clear admin cookie:', err);
  }
}
