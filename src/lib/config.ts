/**
 * Config — env vars are read via ES getters (lazy, call-time).
 * A missing required var only throws at the moment it is first used in a request,
 * never at module-load / build time.
 *
 * Required server-side:  TMDB_API_KEY
 * Required public-side:  NEXT_PUBLIC_TMDB_IMAGE_BASE  (has a sensible fallback)
 */

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    throw new Error(`[DhobiFlix] Missing required environment variable: ${key}`);
  }
  return val.trim();
}

function optionalEnv(key: string, fallback = ''): string {
  return (process.env[key] ?? fallback).trim();
}

// ─── Server-side Config (never exposed to the browser) ───────────────────────

export const serverConfig = {
  get tmdb() {
    return {
      /** Only TMDB_API_KEY is required. All TMDB calls use the v3 key-based API. */
      get apiKey() {
        return requireEnv('TMDB_API_KEY');
      },
      baseUrl: 'https://api.themoviedb.org/3',
    };
  },

  get telemetry() {
    return {
      enabled: optionalEnv('TELEMETRY_ENABLED', 'true') === 'true',
      endpoint: optionalEnv('TELEMETRY_ENDPOINT', '/api/telemetry'),
      flushIntervalMs: parseInt(optionalEnv('TELEMETRY_FLUSH_INTERVAL_MS', '10000'), 10),
    };
  },

  get storage() {
    return {
      localPath: optionalEnv('DOWNLOAD_STORAGE_PATH', '/tmp/dhobiflix-downloads'),
      encryptionKey: optionalEnv('DOWNLOAD_ENCRYPTION_KEY', ''),
    };
  },
};

// ─── Public Config (safe for the browser; NEXT_PUBLIC_ vars only) ────────────

export const publicConfig = {
  tmdb: {
    /** Falls back to the standard TMDB image CDN if the env var is not set. */
    imageBase:
      process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p',
  },
  app: {
    name: 'DhobiFlix',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    environment: (process.env.NEXT_PUBLIC_ENV ?? 'development') as
      | 'development'
      | 'staging'
      | 'production',
  },
} as const;
