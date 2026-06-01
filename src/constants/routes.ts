export const ROUTES = {
  HOME: '/',
  BROWSE: '/search',
  SEARCH: '/search',
  MY_LIST: '/my-list',
  DOWNLOADS: '/downloads',
  SETTINGS: '/settings',
  PROFILES: '/profiles',
  LOGIN: '/login',
  SIGNUP: '/signup',

  MOVIE: (id: number | string) => `/movie/${id}`,
  TV: (id: number | string) => `/tv/${id}`,
  TV_SEASON: (id: number | string, season: number) => `/tv/${id}/season/${season}`,
  TV_EPISODE: (id: number | string, season: number, episode: number) =>
    `/tv/${id}/season/${season}/episode/${episode}`,
  WATCH_MOVIE: (id: number | string) => `/watch/${id}?type=movie`,
  WATCH_TV: (id: number | string, season: number, episode: number) =>
    `/watch/${id}?type=tv&season=${season}&episode=${episode}`,

  API: {
    SEARCH: '/api/search',
    RECOMMENDATIONS: '/api/recommendations',
    PLAYBACK_SESSION: '/api/playback/session',
    DOWNLOADS: '/api/downloads',
    TELEMETRY: '/api/telemetry',
  },
} as const;
