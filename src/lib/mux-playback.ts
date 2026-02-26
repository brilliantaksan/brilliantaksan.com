export function muxPlaybackIdFromUrl(videoUrl: string | null | undefined) {
  if (!videoUrl) return null;

  const trimmed = videoUrl.trim();
  if (!trimmed) return null;

  const streamMatch = trimmed.match(/stream\.mux\.com\/([A-Za-z0-9_-]+)/i);
  if (streamMatch?.[1]) return streamMatch[1];

  return null;
}

export function muxThumbnailUrlFromVideo(videoUrl: string | null | undefined) {
  const playbackId = muxPlaybackIdFromUrl(videoUrl);
  if (!playbackId) return null;

  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1`;
}
