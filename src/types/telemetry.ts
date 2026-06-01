// ─── Primitive Unions ────────────────────────────────────────────────────────

export type TelemetryEventType =
  | 'app_open'
  | 'app_close'
  | 'app_background'
  | 'app_foreground'
  | 'page_view'
  | 'profile_select'
  | 'search_query'
  | 'search_result_click'
  | 'media_detail_view'
  | 'media_add_to_list'
  | 'media_remove_from_list'
  | 'media_rate'
  | 'playback_start'
  | 'playback_pause'
  | 'playback_resume'
  | 'playback_seek'
  | 'playback_end'
  | 'playback_error'
  | 'playback_quality_change'
  | 'playback_buffering'
  | 'download_start'
  | 'download_complete'
  | 'download_delete'
  | 'download_error';

export type NetworkType = 'wifi' | '4g' | '5g' | '3g' | '2g' | 'ethernet' | 'unknown';

export type ClientPlatform = 'web' | 'ios' | 'android' | 'tv' | 'desktop';

// ─── Base ────────────────────────────────────────────────────────────────────

export interface TelemetryBaseEvent {
  eventId: string;
  eventType: TelemetryEventType;
  timestamp: string; // ISO string
  sessionId: string;
  profileId: string;
  accountId: string;
  platform: ClientPlatform;
  appVersion: string;
  networkType: NetworkType;
  deviceId: string;
}

// ─── App Lifecycle ───────────────────────────────────────────────────────────

export interface AppOpenEvent extends TelemetryBaseEvent {
  eventType: 'app_open';
  coldStart: boolean;
  previousSessionId?: string;
}

export interface AppCloseEvent extends TelemetryBaseEvent {
  eventType: 'app_close';
  sessionDurationSeconds: number;
  reason: 'user' | 'crash' | 'system';
}

export interface AppBackgroundEvent extends TelemetryBaseEvent {
  eventType: 'app_background';
}

export interface AppForegroundEvent extends TelemetryBaseEvent {
  eventType: 'app_foreground';
  backgroundDurationSeconds: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface PageViewEvent extends TelemetryBaseEvent {
  eventType: 'page_view';
  pageName: string;
  pageParams?: Record<string, string>;
  referrer?: string;
  loadTimeMs: number;
}

export interface ProfileSelectEvent extends TelemetryBaseEvent {
  eventType: 'profile_select';
  selectedProfileId: string;
  pinEntered: boolean;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchQueryEvent extends TelemetryBaseEvent {
  eventType: 'search_query';
  query: string;
  resultCount: number;
  filters?: Record<string, string | number | boolean>;
  responseTimeMs: number;
}

export interface SearchResultClickEvent extends TelemetryBaseEvent {
  eventType: 'search_result_click';
  query: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  resultPosition: number;
}

// ─── Media Engagement ────────────────────────────────────────────────────────

export interface MediaDetailViewEvent extends TelemetryBaseEvent {
  eventType: 'media_detail_view';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  referrer: string;
}

export interface MediaAddToListEvent extends TelemetryBaseEvent {
  eventType: 'media_add_to_list';
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export interface MediaRemoveFromListEvent extends TelemetryBaseEvent {
  eventType: 'media_remove_from_list';
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export interface MediaRateEvent extends TelemetryBaseEvent {
  eventType: 'media_rate';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  rating: 1 | 2 | 3 | 4 | 5;
  previousRating?: 1 | 2 | 3 | 4 | 5;
}

// ─── Playback ────────────────────────────────────────────────────────────────

export interface PlaybackStartEvent extends TelemetryBaseEvent {
  eventType: 'playback_start';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  episodeId?: number;
  startOffsetSeconds: number;
  renditionId: string;
  isResume: boolean;
  cdnEdgeId: string;
}

export interface PlaybackPauseEvent extends TelemetryBaseEvent {
  eventType: 'playback_pause';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  currentTimeSeconds: number;
}

export interface PlaybackResumeEvent extends TelemetryBaseEvent {
  eventType: 'playback_resume';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  currentTimeSeconds: number;
  pauseDurationSeconds: number;
}

export interface PlaybackSeekEvent extends TelemetryBaseEvent {
  eventType: 'playback_seek';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  fromTimeSeconds: number;
  toTimeSeconds: number;
}

export interface PlaybackEndEvent extends TelemetryBaseEvent {
  eventType: 'playback_end';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  durationSeconds: number;
  watchedSeconds: number;
  completionPercent: number;
}

export interface PlaybackErrorEvent extends TelemetryBaseEvent {
  eventType: 'playback_error';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  errorCode: string;
  errorMessage: string;
  currentTimeSeconds: number;
}

export interface PlaybackQualityChangeEvent extends TelemetryBaseEvent {
  eventType: 'playback_quality_change';
  mediaId: number;
  fromRenditionId: string;
  toRenditionId: string;
  reason: 'bandwidth_up' | 'bandwidth_down' | 'buffer_low' | 'user';
  bandwidthKbps: number;
}

export interface PlaybackBufferingEvent extends TelemetryBaseEvent {
  eventType: 'playback_buffering';
  mediaId: number;
  bufferingDurationMs: number;
  bufferHealthBeforeMs: number;
}

// ─── Downloads ───────────────────────────────────────────────────────────────

export interface DownloadStartEvent extends TelemetryBaseEvent {
  eventType: 'download_start';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  quality: string;
  estimatedSizeBytes: number;
}

export interface DownloadCompleteEvent extends TelemetryBaseEvent {
  eventType: 'download_complete';
  downloadId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  fileSizeBytes: number;
  durationMs: number;
}

export interface DownloadDeleteEvent extends TelemetryBaseEvent {
  eventType: 'download_delete';
  downloadId: string;
  mediaId: number;
  reason: 'user' | 'expired' | 'storage';
}

export interface DownloadErrorEvent extends TelemetryBaseEvent {
  eventType: 'download_error';
  mediaId: number;
  mediaType: 'movie' | 'tv';
  errorCode: string;
  errorMessage: string;
}

// ─── Discriminated Union ─────────────────────────────────────────────────────

export type TelemetryEvent =
  | AppOpenEvent
  | AppCloseEvent
  | AppBackgroundEvent
  | AppForegroundEvent
  | PageViewEvent
  | ProfileSelectEvent
  | SearchQueryEvent
  | SearchResultClickEvent
  | MediaDetailViewEvent
  | MediaAddToListEvent
  | MediaRemoveFromListEvent
  | MediaRateEvent
  | PlaybackStartEvent
  | PlaybackPauseEvent
  | PlaybackResumeEvent
  | PlaybackSeekEvent
  | PlaybackEndEvent
  | PlaybackErrorEvent
  | PlaybackQualityChangeEvent
  | PlaybackBufferingEvent
  | DownloadStartEvent
  | DownloadCompleteEvent
  | DownloadDeleteEvent
  | DownloadErrorEvent;

// ─── Batch Request / Response ────────────────────────────────────────────────

export interface TelemetryBatchRequest {
  events: TelemetryEvent[];
  clientTimestamp: string; // ISO string
  deviceId: string;
  appVersion: string;
}

export interface TelemetryBatchResponse {
  accepted: number;
  rejected: number;
  rejectedEventIds: string[];
  serverTimestamp: string;
}
