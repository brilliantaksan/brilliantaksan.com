import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_SESSION_COOKIE_NAME = 'ba_admin_session';
const ADMIN_SESSION_ISSUER = 'brilliantaksan-admin';
const ADMIN_SESSION_AUDIENCE = 'brilliantaksan-cms';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export interface AdminSession {
  email: string;
}

function getAdminSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) return null;
  return new TextEncoder().encode(value);
}

export function getAdminEmailAllowlist() {
  const source = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? '';
  return source
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailAllowed(email: string | null | undefined) {
  if (!email) return false;
  const allowlist = getAdminEmailAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.toLowerCase());
}

export async function createAdminSessionToken(email: string) {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured.');
  }

  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ADMIN_SESSION_ISSUER)
    .setAudience(ADMIN_SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ADMIN_SESSION_ISSUER,
      audience: ADMIN_SESSION_AUDIENCE
    });
    const email = typeof payload.email === 'string' ? payload.email : null;
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}
