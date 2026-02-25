const MUX_API_BASE_URL = 'https://api.mux.com';

export type MuxDirectUpload = {
  id: string;
  url: string;
};

export type MuxUpload = {
  id: string;
  status?: string;
  asset_id?: string | null;
};

export type MuxAsset = {
  id: string;
  status?: string;
  playback_ids?: Array<{
    id?: string;
    policy?: string;
  }>;
};

function getMuxAuthHeader() {
  const tokenId = process.env.MUX_TOKEN_ID?.trim();
  const tokenSecret = process.env.MUX_TOKEN_SECRET?.trim();

  if (!tokenId || !tokenSecret) {
    throw new Error('Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET.');
  }

  const encoded = Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64');
  return `Basic ${encoded}`;
}

function toErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const root = payload as Record<string, unknown>;

  if (typeof root.error === 'string' && root.error.trim()) return root.error;

  if (root.error && typeof root.error === 'object') {
    const errorObject = root.error as Record<string, unknown>;
    const message = errorObject.messages;
    if (Array.isArray(message) && message.length > 0) {
      const firstMessage = message[0];
      if (typeof firstMessage === 'string' && firstMessage.trim()) return firstMessage;
    }
    if (typeof errorObject.message === 'string' && errorObject.message.trim()) return errorObject.message;
  }

  if (Array.isArray(root.messages) && root.messages.length > 0) {
    const firstMessage = root.messages[0];
    if (typeof firstMessage === 'string' && firstMessage.trim()) return firstMessage;
  }

  return fallback;
}

async function muxApiRequest<T>(path: string, init?: { method?: 'GET' | 'POST'; body?: unknown }) {
  const response = await fetch(`${MUX_API_BASE_URL}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: getMuxAuthHeader(),
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: init?.body ? JSON.stringify(init.body) : undefined
  });

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !payload) {
    const message = toErrorMessage(payload, `Mux API request failed (${response.status}).`);
    throw new Error(message);
  }

  return payload;
}

type MuxDataResponse<T> = { data?: T };

export async function createMuxDirectUpload(options?: { corsOrigin?: string }): Promise<MuxDirectUpload> {
  const body: Record<string, unknown> = {
    timeout: 3600,
    new_asset_settings: {
      playback_policy: ['public'],
      video_quality: 'basic'
    }
  };

  if (options?.corsOrigin) {
    body.cors_origin = options.corsOrigin;
  }

  const response = await muxApiRequest<MuxDataResponse<MuxDirectUpload>>('/video/v1/uploads', {
    method: 'POST',
    body
  });

  if (!response.data?.id || !response.data?.url) {
    throw new Error('Mux did not return a direct upload URL.');
  }

  return response.data;
}

export async function getMuxUpload(uploadId: string): Promise<MuxUpload> {
  const response = await muxApiRequest<MuxDataResponse<MuxUpload>>(`/video/v1/uploads/${uploadId}`);
  if (!response.data?.id) {
    throw new Error('Mux upload lookup failed.');
  }
  return response.data;
}

export async function getMuxAsset(assetId: string): Promise<MuxAsset> {
  const response = await muxApiRequest<MuxDataResponse<MuxAsset>>(`/video/v1/assets/${assetId}`);
  if (!response.data?.id) {
    throw new Error('Mux asset lookup failed.');
  }
  return response.data;
}

export function muxPlaybackUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
