import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';
import { readSiteContent, writeSiteContent } from '@/lib/content-store';
import type { SiteContent } from '@/lib/types';

export const runtime = 'nodejs';

function isSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.meta === 'object' &&
    typeof candidate.hero === 'object' &&
    Array.isArray(candidate.about) &&
    Array.isArray(candidate.work) &&
    Array.isArray(candidate.education) &&
    Array.isArray(candidate.skills) &&
    Array.isArray(candidate.socials) &&
    typeof candidate.booking === 'object' &&
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.creative) &&
    typeof candidate.contact === 'object'
  );
}

async function authorize(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function GET(request: NextRequest) {
  const session = await authorize(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const content = await readSiteContent();
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load content.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await authorize(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    if (!isSiteContent(body.content)) {
      return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 });
    }

    await writeSiteContent(body.content);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save content.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
