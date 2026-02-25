import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';
import { createMuxDirectUpload } from '@/lib/mux-server';

export const runtime = 'nodejs';

async function authorize(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function POST(request: NextRequest) {
  const session = await authorize(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { corsOrigin?: unknown };
    const headerOrigin = request.headers.get('origin');
    const bodyOrigin = typeof body.corsOrigin === 'string' ? body.corsOrigin : undefined;
    const corsOrigin = bodyOrigin || headerOrigin || undefined;

    const upload = await createMuxDirectUpload({
      corsOrigin: corsOrigin && corsOrigin !== 'null' ? corsOrigin : undefined
    });

    return NextResponse.json(
      {
        uploadId: upload.id,
        uploadUrl: upload.url
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create direct upload.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
