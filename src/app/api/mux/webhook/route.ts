import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

type MuxPlaybackId = {
  id?: string;
  policy?: string;
};

type MuxWebhookEvent = {
  id?: string;
  type?: string;
  object?: {
    id?: string;
    type?: string;
  };
  data?: {
    id?: string;
    status?: string;
    playback_ids?: MuxPlaybackId[];
  };
};

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseMuxSignatureHeader(value: string) {
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const rawPart of value.split(',')) {
    const part = rawPart.trim();
    if (!part) continue;

    const separatorIndex = part.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = part.slice(0, separatorIndex).trim();
    const headerValue = part.slice(separatorIndex + 1).trim();
    if (!headerValue) continue;

    if (key === 't') timestamp = headerValue;
    if (key === 'v1') signatures.push(headerValue);
  }

  return { timestamp, signatures };
}

function isMuxWebhookEvent(value: unknown): value is MuxWebhookEvent {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.type === 'string';
}

function verifyMuxSignature(rawBody: string, signatureHeader: string, secret: string) {
  const { timestamp, signatures } = parseMuxSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) return false;

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - parsedTimestamp) > MAX_SIGNATURE_AGE_SECONDS) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return signatures.some((signature) => timingSafeEqualHex(expected, signature));
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.MUX_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Mux webhook secret is not configured.' }, { status: 500 });
  }

  const signatureHeader = request.headers.get('mux-signature');
  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing mux-signature header.' }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyMuxSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!isMuxWebhookEvent(payload)) {
    return NextResponse.json({ error: 'Invalid Mux event payload.' }, { status: 400 });
  }

  const assetId = payload.data?.id ?? payload.object?.id ?? 'unknown';

  if (payload.type === 'video.asset.ready') {
    const playbackIds = payload.data?.playback_ids?.map((item) => item.id).filter(Boolean) ?? [];
    console.info('[mux webhook] video.asset.ready', { assetId, playbackIds });
  } else if (payload.type === 'video.asset.errored') {
    console.warn('[mux webhook] video.asset.errored', { assetId, eventId: payload.id ?? null });
  } else {
    console.info('[mux webhook] event received', { type: payload.type, assetId, eventId: payload.id ?? null });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
