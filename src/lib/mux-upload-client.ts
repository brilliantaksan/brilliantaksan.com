export type AdminMuxDirectUploadResult = {
  uploadId: string;
  uploadUrl: string;
};

export type AdminMuxUploadStatusResult = {
  status: 'waiting' | 'ready' | 'errored';
  playbackUrl?: string;
  error?: string;
};

function parseErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const value = payload as Record<string, unknown>;
  if (typeof value.error === 'string' && value.error.trim()) return value.error;
  return fallback;
}

async function toJson(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createAdminMuxDirectUpload(): Promise<AdminMuxDirectUploadResult> {
  const response = await fetch('/api/admin/mux/direct-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  const payload = await toJson(response);
  if (!response.ok || !payload || typeof payload !== 'object') {
    throw new Error(parseErrorMessage(payload, 'Failed to create Mux direct upload.'));
  }

  const result = payload as Record<string, unknown>;
  const uploadId = typeof result.uploadId === 'string' ? result.uploadId : '';
  const uploadUrl = typeof result.uploadUrl === 'string' ? result.uploadUrl : '';

  if (!uploadId || !uploadUrl) {
    throw new Error('Invalid Mux direct upload response.');
  }

  return { uploadId, uploadUrl };
}

export async function uploadFileToMux(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream'
    },
    body: file
  });

  if (!response.ok) {
    throw new Error(`Mux upload failed (${response.status}).`);
  }
}

export async function waitForAdminMuxPlaybackUrl(
  uploadId: string,
  options?: { maxAttempts?: number; intervalMs?: number }
) {
  const maxAttempts = options?.maxAttempts ?? 80;
  const intervalMs = options?.intervalMs ?? 2500;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(`/api/admin/mux/upload/${uploadId}`, { cache: 'no-store' });
    const payload = (await toJson(response)) as AdminMuxUploadStatusResult | null;

    if (!response.ok || !payload) {
      throw new Error(parseErrorMessage(payload, 'Failed to read Mux upload status.'));
    }

    if (payload.status === 'ready' && payload.playbackUrl) {
      return payload.playbackUrl;
    }

    if (payload.status === 'errored') {
      throw new Error(payload.error || 'Mux reported an errored asset.');
    }

    await sleep(intervalMs);
  }

  throw new Error('Mux processing timed out. Please try again in a minute.');
}
