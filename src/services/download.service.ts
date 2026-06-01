import type { Download, DownloadCreateRequest, DownloadUpdateRequest, DownloadStorageSummary } from '@/types/download';
import { MOCK_DOWNLOADS } from '@/data/mockDownloads';
import { DOWNLOAD_QUALITY_SPECS, estimateDownloadSize } from '@/data/abrLadder';
import { DOWNLOAD_EXPIRY_DAYS, PLAN_LIMITS } from '@/constants/app';
import { generateId, formatBytes } from '@/lib/utils';

// In-memory store seeded from mock data
const store = new Map<string, Download>(MOCK_DOWNLOADS.map((d) => [d.id, d]));

export function getProfileDownloads(profileId: string): Download[] {
  return Array.from(store.values()).filter((d) => d.profileId === profileId);
}

export function getDownloadById(id: string): Download | undefined {
  return store.get(id);
}

export function createDownload(req: DownloadCreateRequest): Download {
  const id = generateId();
  const expiresAt = new Date(Date.now() + DOWNLOAD_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const spec = DOWNLOAD_QUALITY_SPECS[req.quality];
  const fileSizeBytes = req.durationSeconds
    ? estimateDownloadSize(req.quality, req.durationSeconds)
    : spec.estimatedMbPerHour * 1024 * 1024;

  const download: Download = {
    id,
    profileId: req.profileId,
    mediaId: req.mediaId,
    mediaType: req.mediaType,
    title: req.title,
    posterPath: req.posterPath ?? null,
    quality: req.quality,
    status: 'queued',
    progressPercent: 0,
    fileSizeBytes,
    downloadedBytes: 0,
    durationSeconds: req.durationSeconds ?? 0,
    localPath: undefined,
    encryptionKeyId: undefined,
    expiresAt,
    createdAt: now,
    updatedAt: now,
    seasonNumber: req.seasonNumber,
    episodeNumber: req.episodeNumber,
    resumeToken: undefined,
  };

  store.set(id, download);
  return download;
}

export function updateDownload(id: string, update: DownloadUpdateRequest): Download | undefined {
  const existing = store.get(id);
  if (!existing) return undefined;

  const updated: Download = {
    ...existing,
    ...update,
    updatedAt: new Date().toISOString(),
  };

  // Auto-set localPath and encryptionKeyId when status becomes completed
  if (update.status === 'completed') {
    updated.localPath = updated.localPath ?? `/downloads/${id}.dhf`;
    updated.encryptionKeyId = updated.encryptionKeyId ?? `key_${id}`;
    updated.downloadedBytes = updated.fileSizeBytes;
  }

  store.set(id, updated);
  return updated;
}

export function deleteDownload(id: string): boolean {
  return store.delete(id);
}

export function pauseDownload(id: string): Download | undefined {
  const existing = store.get(id);
  if (!existing || existing.status !== 'downloading') return undefined;

  const updated: Download = {
    ...existing,
    status: 'paused',
    resumeToken: `rt_${id}_chunk_${Math.floor(existing.downloadedBytes / (1024 * 1024))}`,
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function resumeDownload(id: string): Download | undefined {
  const existing = store.get(id);
  if (!existing || existing.status !== 'paused') return undefined;

  const updated: Download = {
    ...existing,
    status: 'downloading',
    updatedAt: new Date().toISOString(),
  };

  store.set(id, updated);
  return updated;
}

export function getStorageSummary(profileId: string): DownloadStorageSummary {
  const downloads = getProfileDownloads(profileId);
  const plan = 'premium'; // TODO: resolve from account
  const limits = PLAN_LIMITS[plan];

  const usedStorageBytes = downloads.reduce((sum, d) => sum + d.downloadedBytes, 0);
  const totalStorageBytes = limits.maxDownloads * 1024 * 1024 * 1024; // rough: 1GB per download slot

  return {
    profileId,
    totalDownloads: downloads.length,
    completedDownloads: downloads.filter((d) => d.status === 'completed').length,
    activeDownloads: downloads.filter((d) => d.status === 'downloading' || d.status === 'queued').length,
    totalStorageBytes,
    usedStorageBytes,
    availableStorageBytes: Math.max(0, totalStorageBytes - usedStorageBytes),
  };
}

export function canDownload(profileId: string): boolean {
  const plan = 'premium'; // TODO: resolve from account
  const limits = PLAN_LIMITS[plan];
  const active = getProfileDownloads(profileId).filter(
    (d) => d.status === 'completed' || d.status === 'downloading' || d.status === 'paused'
  );
  return active.length < limits.maxDownloads;
}

export function pruneExpiredDownloads(): number {
  const now = Date.now();
  let pruned = 0;
  for (const [id, dl] of store.entries()) {
    if (new Date(dl.expiresAt).getTime() < now) {
      store.delete(id);
      pruned++;
    }
  }
  return pruned;
}

export function validateDownloadRequest(req: DownloadCreateRequest): string | null {
  if (!req.profileId) return 'profileId is required';
  if (!req.mediaId) return 'mediaId is required';
  if (!req.mediaType) return 'mediaType is required';
  if (!req.quality) return 'quality is required';
  if (!req.title) return 'title is required';
  return null;
}

export function estimateDownloadTime(
  req: DownloadCreateRequest,
  bandwidthKbps: number
): number {
  if (!req.durationSeconds) return 0;
  const bytes = estimateDownloadSize(req.quality, req.durationSeconds);
  const bitsPerSecond = bandwidthKbps * 1000;
  return Math.ceil((bytes * 8) / bitsPerSecond);
}

export function getQualityLabel(download: Download): string {
  return DOWNLOAD_QUALITY_SPECS[download.quality]?.label ?? download.quality;
}
