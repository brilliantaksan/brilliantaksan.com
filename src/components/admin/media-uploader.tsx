'use client';

import { useMemo, useState } from 'react';
import {
  createAdminMuxDirectUpload,
  uploadFileToMux,
  waitForAdminMuxPlaybackUrl
} from '@/lib/mux-upload-client';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

function sanitizeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
}

export function MediaUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const bucket = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || 'media', []);

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError('');
    setUrl('');

    try {
      if (file.type.startsWith('video/')) {
        const { uploadId, uploadUrl } = await createAdminMuxDirectUpload();
        await uploadFileToMux(uploadUrl, file);
        const playbackUrl = await waitForAdminMuxPlaybackUrl(uploadId);
        setUrl(playbackUrl);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const filePath = `uploads/${Date.now()}-${sanitizeFilename(file.name)}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: false,
        cacheControl: '3600'
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUrl(data.publicUrl);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card/70 p-4">
      <p className="text-sm font-semibold">Media Upload</p>
      <p className="text-sm text-muted-foreground">
        Video files upload to Mux. Image files upload to Supabase.
      </p>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="block w-full rounded-lg border border-border bg-background p-2 text-sm"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {url ? (
        <div className="space-y-1 rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-semibold text-foreground">Uploaded URL</p>
          <p className="break-all text-xs text-muted-foreground">{url}</p>
        </div>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
