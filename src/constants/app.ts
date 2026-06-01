import type { AccountPlan, MaturityRating, Language } from '@/types/profile';
import type { VideoCodec } from '@/types/playback';

export interface PlanLimits {
  maxResolution: '480p' | '720p' | '1080p' | '4K';
  maxDownloads: number;
  maxStreams: number;
  hasHDR: boolean;
  hasDolbyAtmos: boolean;
  maxProfiles: number;
}

export const PLAN_LIMITS: Record<AccountPlan, PlanLimits> = {
  mobile: {
    maxResolution: '480p',
    maxDownloads: 1,
    maxStreams: 1,
    hasHDR: false,
    hasDolbyAtmos: false,
    maxProfiles: 1,
  },
  basic: {
    maxResolution: '1080p',
    maxDownloads: 0,
    maxStreams: 1,
    hasHDR: false,
    hasDolbyAtmos: false,
    maxProfiles: 2,
  },
  standard: {
    maxResolution: '1080p',
    maxDownloads: 30,
    maxStreams: 2,
    hasHDR: false,
    hasDolbyAtmos: false,
    maxProfiles: 3,
  },
  premium: {
    maxResolution: '4K',
    maxDownloads: 100,
    maxStreams: 4,
    hasHDR: true,
    hasDolbyAtmos: true,
    maxProfiles: 5,
  },
};

export const DOWNLOAD_EXPIRY_DAYS = 30;

export const PLAYBACK = {
  SESSION_DURATION_MS: 4 * 60 * 60 * 1000, // 4 hours
  HEARTBEAT_INTERVAL_MS: 30_000,
  SKIP_INTRO_WINDOW_S: 90,
  NEXT_EPISODE_TRIGGER_S: 30,
  MIN_PROGRESS_TO_SAVE: 0.05,
  MAX_PROGRESS_TO_RESUME: 0.95,
  ABR_STEP_UP_BANDWIDTH_RATIO: 1.5,
  ABR_STEP_DOWN_BANDWIDTH_RATIO: 0.8,
  PREFERRED_CODEC_ORDER: ['av1', 'h265', 'h264'] as VideoCodec[],
} as const;

export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_MS: 300,
  MAX_SUGGESTIONS: 8,
  DEFAULT_PAGE_SIZE: 20,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const RECOMMENDATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  GENRE_AFFINITY_WEIGHT: 0.4,
  RATING_WEIGHT: 0.35,
  POPULARITY_WEIGHT: 0.25,
  CONTINUE_WATCHING_MAX: 10,
} as const;

export const TELEMETRY = {
  MAX_QUEUE_SIZE: 200,
  MAX_BATCH_SIZE: 50,
  FLUSH_INTERVAL_MS: 10_000,
  MAX_EVENT_AGE_MS: 60 * 60 * 1000, // 1 hour
  ENDPOINT: '/api/telemetry',
} as const;

export const MATURITY_RATINGS: MaturityRating[] = ['U', 'U/A 7+', 'U/A 13+', 'U/A 16+', 'A'];

export const MATURITY_RATING_ORDER: Record<MaturityRating, number> = {
  U: 0,
  'U/A 7+': 1,
  'U/A 13+': 2,
  'U/A 16+': 3,
  A: 4,
};

export const SUPPORTED_LANGUAGES: Language[] = [
  'hi', 'en', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa',
];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
