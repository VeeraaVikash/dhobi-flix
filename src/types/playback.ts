// ─── Primitive Unions ────────────────────────────────────────────────────────

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'buffering'
  | 'playing'
  | 'paused'
  | 'seeking'
  | 'ended'
  | 'error';

export type DRMScheme = 'widevine' | 'fairplay' | 'playready' | 'none';

export type VideoCodec = 'h264' | 'h265' | 'av1' | 'vp9';

export type PlaybackRate = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0;

// ─── Tracks ──────────────────────────────────────────────────────────────────

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  codec: string;
  bitrate: number; // kbps
  channels: number;
  isDefault: boolean;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  format: 'vtt' | 'srt' | 'ttml';
  url: string;
  isDefault: boolean;
  isForced: boolean;
  isSDH: boolean; // Subtitles for the Deaf and Hard-of-hearing
}

// ─── Rendition (ABR Ladder Rung) ─────────────────────────────────────────────

export interface Rendition {
  id: string;
  width: number;
  height: number;
  bitrate: number; // kbps
  frameRate: number;
  codec: VideoCodec;
  label: string; // '1080p', '4K', etc.
}

// ─── Manifest ────────────────────────────────────────────────────────────────

export interface PlaybackManifest {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  manifestUrl: string;
  drmScheme: DRMScheme;
  drmLicenseUrl?: string;
  renditions: Rendition[];
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
  cdnEdgeId: string;
  expiresAt: string; // ISO string
  startOffset?: number; // seconds — for resume
  introStart?: number; // seconds
  introEnd?: number; // seconds
  outroStart?: number; // seconds
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface PlaybackSession {
  id: string;
  profileId: string;
  accountId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  manifest: PlaybackManifest;
  state: PlaybackState;
  currentTime: number; // seconds
  duration: number; // seconds
  selectedRenditionId: string;
  selectedAudioTrackId: string;
  selectedSubtitleTrackId: string | null;
  playbackRate: PlaybackRate;
  volume: number; // 0–1
  isMuted: boolean;
  startedAt: string; // ISO string
  lastHeartbeatAt: string; // ISO string
  heartbeatIntervalMs: number;
}

// ─── Request / Response ──────────────────────────────────────────────────────

export interface PlaybackSessionCreateRequest {
  profileId: string;
  accountId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  preferredAudioLanguage?: string;
  preferredSubtitleLanguage?: string;
  bandwidthKbps?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  preferredEdgeId?: string;
  startPositionSeconds?: number;
}

export interface PlaybackSessionCreateResponse {
  session: PlaybackSession;
  manifest: PlaybackManifest;
}

// ─── Heartbeat ───────────────────────────────────────────────────────────────

export interface PlaybackHeartbeat {
  sessionId: string;
  currentTime: number;
  state: PlaybackState;
  renditionId: string;
  bufferHealth: number; // seconds of buffered content ahead
  droppedFrames: number;
  timestamp: string; // ISO string
}

// ─── ABR Metrics ─────────────────────────────────────────────────────────────

export interface ABRMetrics {
  currentRenditionId: string;
  bufferHealth: number; // seconds
  droppedFrameRate: number; // 0–1
  estimatedBandwidth: number; // kbps
  switchReason?: 'bandwidth_up' | 'bandwidth_down' | 'buffer_low' | 'initial';
}
