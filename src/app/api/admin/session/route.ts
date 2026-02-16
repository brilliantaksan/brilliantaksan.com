import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminEmailAllowed,
  verifyAdminSessionToken
} from '@/lib/admin-session';
import { createSupabaseServerClient } from '@/lib/supabase-server';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS
  };
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const session = await verifyAdminSessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true, email: session.email }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = body.accessToken?.trim();

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token.' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid Supabase session.' }, { status: 401 });
    }

    const email = data.user.email?.toLowerCase() ?? '';
    if (!isAdminEmailAllowed(email)) {
      return NextResponse.json({ error: 'Account is not authorized for admin access.' }, { status: 403 });
    }

    const signedToken = await createAdminSessionToken(email);
    const response = NextResponse.json({ authenticated: true, email }, { status: 200 });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, signedToken, sessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create admin session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false }, { status: 200 });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
    ...sessionCookieOptions(),
    maxAge: 0
  });
  return response;
}
