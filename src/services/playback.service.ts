import type {
  PlaybackSession,
  PlaybackSessionCreateRequest,
  PlaybackHeartbeat,
  Rendition,
} from '@/types/playback';
import { generateId } from '@/lib/utils';
import { PLAYBACK, PLAN_LIMITS } from '@/constants/app';
import { selectRenditionForBandwidth, getRenditionsForPlan } from '@/data/abrLadder';

/** Create a new playback session from a creation request. */
export function createPlaybackSession(
  req: PlaybackSessionCreateRequest,
  durationSeconds: number
): PlaybackSession {
  const plan = 'premium'; // TODO: resolve from account record
  const planLimits = PLAN_LIMITS[plan];
  const renditions = getRenditionsForPlan(planLimits.maxResolution);

  const startRendition = renditions[Math.floor(renditions.length / 2)] ?? renditions[0];

  return {
    id: generateId(),
    profileId: req.profileId,
    accountId: req.accountId || 'account_001',
    mediaId: req.mediaId,
    mediaType: req.mediaType,
    episodeId: req.episodeId,
    manifest: {
      mediaId: req.mediaId,
      mediaType: req.mediaType,
      episodeId: req.episodeId,
      manifestUrl: `https://edge_mum1.dhobiflix.in/hls/${req.mediaId}/master.m3u8`,
      drmScheme: 'none',
      renditions,
      audioTracks: [
        {
          id: 'audio_en',
          language: 'en',
          label: 'English',
          codec: 'aac',
          bitrate: 128,
          channels: 2,
          isDefault: true,
        }
      ],
      subtitleTracks: [],
      cdnEdgeId: req.preferredEdgeId ?? 'edge_mum1',
      expiresAt: new Date(Date.now() + PLAYBACK.SESSION_DURATION_MS).toISOString(),
    },
    state: 'playing',
    currentTime: req.startPositionSeconds ?? 0,
    duration: durationSeconds,
    selectedRenditionId: startRendition.id,
    selectedAudioTrackId: 'audio_en',
    selectedSubtitleTrackId: null,
    playbackRate: 1.0,
    volume: 0.8,
    isMuted: false,
    startedAt: new Date().toISOString(),
    lastHeartbeatAt: new Date().toISOString(),
    heartbeatIntervalMs: 30000,
  };
}

/** Apply a heartbeat update to an existing session. Returns updated session. */
export function processHeartbeat(
  session: PlaybackSession,
  beat: PlaybackHeartbeat
): PlaybackSession {
  return {
    ...session,
    currentTime: beat.currentTime,
    state: beat.state,
    lastHeartbeatAt: new Date().toISOString(),
    selectedRenditionId: beat.renditionId ?? session.selectedRenditionId,
  };
}

/** Return true if the session has passed its expiry timestamp. */
export function isSessionExpired(session: PlaybackSession): boolean {
  return Date.now() > new Date(session.manifest.expiresAt).getTime();
}

/**
 * Suggest a new rendition based on reported bandwidth.
 * Steps up if bandwidth is 1.5× current bitrate, steps down if < 0.8×.
 */
export function adaptRendition(
  session: PlaybackSession,
  reportedBandwidthKbps: number
): Rendition | null {
  const current = session.manifest.renditions.find(
    (r) => r.id === session.selectedRenditionId
  );
  if (!current) return null;

  const suggested = selectRenditionForBandwidth(reportedBandwidthKbps);

  const stepUp = reportedBandwidthKbps >= current.bitrate * PLAYBACK.ABR_STEP_UP_BANDWIDTH_RATIO;
  const stepDown = reportedBandwidthKbps < current.bitrate * PLAYBACK.ABR_STEP_DOWN_BANDWIDTH_RATIO;

  if (!stepUp && !stepDown) return null;
  if (suggested.id === session.selectedRenditionId) return null;

  return suggested;
}

/** Return the playback progress as a percentage (0–100). */
export function getProgressPercent(session: PlaybackSession): number {
  if (session.duration === 0) return 0;
  return Math.min(
    100,
    Math.round((session.currentTime / session.duration) * 100)
  );
}

/** Return true if the current position is within the skip-intro window (0–90s). */
export function shouldSkipIntro(session: PlaybackSession): boolean {
  return session.currentTime <= PLAYBACK.SKIP_INTRO_WINDOW_S;
}

/** Return remaining duration in seconds. */
export function getRemainingTime(session: PlaybackSession): number {
  return Math.max(0, session.duration - session.currentTime);
}

/** Return the position at which to show the "Next Episode" prompt. */
export function getNextEpisodeTriggerTime(session: PlaybackSession): number {
  return Math.max(0, session.duration - PLAYBACK.NEXT_EPISODE_TRIGGER_S);
}

/** Validate a playback session creation request. Returns an error string or null. */
export function validatePlaybackRequest(req: PlaybackSessionCreateRequest): string | null {
  if (!req.profileId) return 'profileId is required';
  if (!req.mediaId) return 'mediaId is required';
  if (!req.mediaType) return 'mediaType is required';
  if (req.mediaType === 'tv' && (req.seasonNumber == null || req.episodeNumber == null)) {
    return 'seasonNumber and episodeNumber are required for TV media';
  }
  return null;
}
