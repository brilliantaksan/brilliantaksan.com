import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/admin-session';
import { getMuxAsset, getMuxUpload, muxPlaybackUrl } from '@/lib/mux-server';

export const runtime = 'nodejs';

async function authorize(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ uploadId: string }>;
  }
) {
  const session = await authorize(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uploadId } = await context.params;
  if (!uploadId) {
    return NextResponse.json({ error: 'Missing upload id.' }, { status: 400 });
  }

  try {
    const upload = await getMuxUpload(uploadId);
    if (!upload.asset_id) {
      return NextResponse.json(
        {
          status: 'waiting',
          uploadStatus: upload.status ?? 'waiting'
        },
        { status: 200 }
      );
    }

    const asset = await getMuxAsset(upload.asset_id);
    if (asset.status === 'errored') {
      return NextResponse.json(
        {
          status: 'errored',
          assetId: asset.id,
          uploadStatus: upload.status ?? null
        },
        { status: 200 }
      );
    }

    if (asset.status !== 'ready') {
      return NextResponse.json(
        {
          status: 'waiting',
          assetId: asset.id,
          assetStatus: asset.status ?? 'preparing'
        },
        { status: 200 }
      );
    }

    const playbackId = asset.playback_ids?.find((item) => item.policy === 'public')?.id ?? asset.playback_ids?.[0]?.id;
    if (!playbackId) {
      return NextResponse.json(
        {
          status: 'waiting',
          assetId: asset.id,
          assetStatus: asset.status
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: 'ready',
        assetId: asset.id,
        playbackId,
        playbackUrl: muxPlaybackUrl(playbackId)
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Mux upload status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
