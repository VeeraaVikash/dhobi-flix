// ─── Primitive Unions ────────────────────────────────────────────────────────

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'expired';

export type DownloadQuality = 'standard' | 'high' | 'ultra';

// ─── Quality Spec ────────────────────────────────────────────────────────────

export interface DownloadQualitySpec {
  quality: DownloadQuality;
  label: string;
  maxBitrateKbps: number;
  maxResolution: string;
  estimatedMbPerHour: number;
}

// ─── Download Record ─────────────────────────────────────────────────────────

export interface Download {
  id: string;
  profileId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  title: string;
  posterPath: string | null;
  quality: DownloadQuality;
  status: DownloadStatus;
  progressPercent: number;
  fileSizeBytes: number;
  downloadedBytes: number;
  durationSeconds: number;
  localPath?: string;
  encryptionKeyId?: string;
  resumeToken?: string;
  expiresAt: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  errorMessage?: string;
}

// ─── Request / Update Payloads ───────────────────────────────────────────────

export interface DownloadCreateRequest {
  profileId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  title: string;
  posterPath?: string | null;
  quality: DownloadQuality;
  durationSeconds: number;
}

export interface DownloadUpdateRequest {
  status?: DownloadStatus;
  progressPercent?: number;
  downloadedBytes?: number;
  errorMessage?: string;
}

// Single PATCH endpoint handles pause / resume / progress update
export interface DownloadPatchBody {
  action: 'pause' | 'resume' | 'update';
  update?: DownloadUpdateRequest;
}

// ─── Storage Summary ─────────────────────────────────────────────────────────

export interface DownloadStorageSummary {
  profileId: string;
  totalDownloads: number;
  completedDownloads: number;
  activeDownloads: number;
  totalStorageBytes: number;
  usedStorageBytes: number;
  availableStorageBytes: number;
}
