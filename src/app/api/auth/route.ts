import { NextRequest, NextResponse } from 'next/server';
import oauthProvider from 'netlify-cms-oauth-provider-node';

export const runtime = 'nodejs';

type CreateHandlersResult = {
  begin: (params?: Record<string, string | null>) => Promise<string>;
  complete: (code: string, params?: Record<string, string>) => Promise<string>;
};

function getOAuthHandlers(request: NextRequest): CreateHandlersResult {
  const { createHandlers } = oauthProvider as {
    createHandlers: (config: Record<string, string | string[]>) => CreateHandlersResult;
  };

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID ?? process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET ?? process.env.OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing GitHub OAuth credentials: GITHUB_OAUTH_CLIENT_ID / GITHUB_OAUTH_CLIENT_SECRET.');
  }

  const requestOrigin = request.nextUrl.origin;
  const allowedOrigins = (process.env.CMS_OAUTH_ORIGIN ?? requestOrigin)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return createHandlers({
    origin: allowedOrigins,
    completeUrl: `${requestOrigin}/api/auth`,
    adminPanelUrl: `${requestOrigin}/admin/studio`,
    oauthClientID: clientId,
    oauthClientSecret: clientSecret
  });
}

export async function GET(request: NextRequest) {
  try {
    const { begin, complete } = getOAuthHandlers(request);
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const code = request.nextUrl.searchParams.get('code');

    if (code) {
      const html = await complete(code, params);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html;charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    const redirectUrl = await begin({
      state: request.nextUrl.searchParams.get('state')
    });
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth provider initialization failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
