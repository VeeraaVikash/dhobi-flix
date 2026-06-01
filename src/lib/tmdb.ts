/**
 * TMDB API wrapper — SERVER-SIDE ONLY.
 * Never import this file in client components or hooks.
 * All functions use Next.js ISR cache with per-endpoint revalidation + tags.
 */

import { serverConfig } from './config';
import type {
  Movie,
  TVShow,
  TVEpisode,
  Credits,
  VideosResult,
  TMDBPaginatedResponse,
  SearchMultiResult,
  MovieReleaseDates,
  DiscoverMovieParams,
  DiscoverTVParams,
} from '../types/movie';
import {
  MOCK_MOVIES,
  MOCK_TV,
  MOCK_CREDITS,
  MOCK_VIDEOS,
  MOCK_EPISODE,
} from './mockTmdbData';

// ─── Internal Fetcher ────────────────────────────────────────────────────────

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  cacheOptions: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  const apiKey = serverConfig.tmdb.apiKey; // throws if missing — intentional
  const qs = new URLSearchParams();
  qs.set('api_key', apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }

  const url = `${serverConfig.tmdb.baseUrl}${path}?${qs.toString()}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: cacheOptions.revalidate ?? 3600,
        tags: cacheOptions.tags,
      },
    });

    if (!res.ok) {
      throw new Error(
        `[TMDB] ${res.status} ${res.statusText} — GET ${path}`
      );
    }

    return await res.json() as T;
  } catch (error) {
    console.warn(`[TMDB] Fetch failed for ${path}, using mock fallback.`, error);

    if (
      path.startsWith('/trending/movie') ||
      path.includes('/movie/popular') ||
      path.includes('/movie/top_rated') ||
      path.includes('/movie/now_playing') ||
      path.includes('/movie/upcoming') ||
      path.includes('/recommendations') ||
      path.includes('/similar')
    ) {
      return {
        page: 1,
        results: MOCK_MOVIES,
        total_pages: 1,
        total_results: MOCK_MOVIES.length,
      } as unknown as T;
    }

    if (
      path.startsWith('/trending/tv') ||
      path.includes('/tv/popular') ||
      path.includes('/tv/top_rated')
    ) {
      return {
        page: 1,
        results: MOCK_TV,
        total_pages: 1,
        total_results: MOCK_TV.length,
      } as unknown as T;
    }

    if (path.startsWith('/movie/') && path.endsWith('/credits')) {
      const movieId = Number(path.split('/')[2]);
      return (MOCK_CREDITS[movieId] || { id: movieId, cast: [], crew: [] }) as unknown as T;
    }

    if (path.startsWith('/tv/') && path.endsWith('/credits')) {
      const tvId = Number(path.split('/')[2]);
      return { id: tvId, cast: [], crew: [] } as unknown as T;
    }

    if (path.startsWith('/movie/') && path.endsWith('/videos')) {
      const movieId = Number(path.split('/')[2]);
      return (MOCK_VIDEOS[movieId] || { id: movieId, results: [] }) as unknown as T;
    }

    if (path.startsWith('/tv/') && path.endsWith('/videos')) {
      const tvId = Number(path.split('/')[2]);
      return { id: tvId, results: [] } as unknown as T;
    }

    if (path.startsWith('/movie/')) {
      const movieId = Number(path.split('/')[2]);
      const found = MOCK_MOVIES.find((m) => m.id === movieId);
      return (found || MOCK_MOVIES[0]) as unknown as T;
    }

    if (path.startsWith('/tv/') && path.includes('/season/') && path.includes('/episode/')) {
      return MOCK_EPISODE as unknown as T;
    }

    if (path.startsWith('/tv/')) {
      const tvId = Number(path.split('/')[2]);
      const found = MOCK_TV.find((t) => t.id === tvId);
      return (found || MOCK_TV[0]) as unknown as T;
    }

    if (path.includes('/search/')) {
      return {
        page: 1,
        results: [...MOCK_MOVIES, ...MOCK_TV],
        total_pages: 1,
        total_results: MOCK_MOVIES.length + MOCK_TV.length,
      } as unknown as T;
    }

    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    } as unknown as T;
  }
}

// ─── Trending ────────────────────────────────────────────────────────────────

export function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    `/trending/movie/${timeWindow}`,
    {},
    { revalidate: 3600, tags: ['trending', 'movies'] }
  );
}

export function getTrendingTV(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    `/trending/tv/${timeWindow}`,
    {},
    { revalidate: 3600, tags: ['trending', 'tv'] }
  );
}

// ─── Popular ─────────────────────────────────────────────────────────────────

export function getPopularMovies(
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/movie/popular',
    { page },
    { revalidate: 3600, tags: ['popular', 'movies'] }
  );
}

export function getPopularTV(
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    '/tv/popular',
    { page },
    { revalidate: 3600, tags: ['popular', 'tv'] }
  );
}

// ─── Top Rated ───────────────────────────────────────────────────────────────

export function getTopRatedMovies(
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/movie/top_rated',
    { page },
    { revalidate: 86400, tags: ['top-rated', 'movies'] }
  );
}

export function getTopRatedTV(
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    '/tv/top_rated',
    { page },
    { revalidate: 86400, tags: ['top-rated', 'tv'] }
  );
}

// ─── Now Playing / Upcoming / Airing Today ───────────────────────────────────

export function getNowPlayingMovies(
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/movie/now_playing',
    { page },
    { revalidate: 3600, tags: ['now-playing', 'movies'] }
  );
}

export function getUpcomingMovies(
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/movie/upcoming',
    { page },
    { revalidate: 3600, tags: ['upcoming', 'movies'] }
  );
}

export function getAiringTodayTV(
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    '/tv/airing_today',
    { page },
    { revalidate: 1800, tags: ['airing-today', 'tv'] }
  );
}

// ─── Details ─────────────────────────────────────────────────────────────────

export function getMovieDetails(id: number): Promise<Movie> {
  return tmdbFetch<Movie>(
    `/movie/${id}`,
    { append_to_response: 'genres,release_dates' },
    { revalidate: 86400, tags: [`movie-${id}`] }
  );
}

export function getTVDetails(id: number): Promise<TVShow> {
  return tmdbFetch<TVShow>(
    `/tv/${id}`,
    { append_to_response: 'genres' },
    { revalidate: 86400, tags: [`tv-${id}`] }
  );
}

export function getTVEpisodeDetails(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TVEpisode> {
  return tmdbFetch<TVEpisode>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
    {},
    { revalidate: 86400, tags: [`tv-${tvId}`, `tv-${tvId}-s${seasonNumber}e${episodeNumber}`] }
  );
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export function getMovieCredits(id: number): Promise<Credits> {
  return tmdbFetch<Credits>(
    `/movie/${id}/credits`,
    {},
    { revalidate: 86400, tags: [`movie-${id}`, `movie-${id}-credits`] }
  );
}

export function getTVCredits(id: number): Promise<Credits> {
  return tmdbFetch<Credits>(
    `/tv/${id}/credits`,
    {},
    { revalidate: 86400, tags: [`tv-${id}`, `tv-${id}-credits`] }
  );
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export function getMovieVideos(id: number): Promise<VideosResult> {
  return tmdbFetch<VideosResult>(
    `/movie/${id}/videos`,
    {},
    { revalidate: 86400, tags: [`movie-${id}`, `movie-${id}-videos`] }
  );
}

export function getTVVideos(id: number): Promise<VideosResult> {
  return tmdbFetch<VideosResult>(
    `/tv/${id}/videos`,
    {},
    { revalidate: 86400, tags: [`tv-${id}`, `tv-${id}-videos`] }
  );
}

// ─── Similar ─────────────────────────────────────────────────────────────────

export function getSimilarMovies(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    `/movie/${id}/similar`,
    { page },
    { revalidate: 86400, tags: [`movie-${id}`, `movie-${id}-similar`] }
  );
}

export function getSimilarTV(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    `/tv/${id}/similar`,
    { page },
    { revalidate: 86400, tags: [`tv-${id}`, `tv-${id}-similar`] }
  );
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function getMovieRecommendations(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    `/movie/${id}/recommendations`,
    { page },
    { revalidate: 86400, tags: [`movie-${id}`, `movie-${id}-recommendations`] }
  );
}

export function getTVRecommendations(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    `/tv/${id}/recommendations`,
    { page },
    { revalidate: 86400, tags: [`tv-${id}`, `tv-${id}-recommendations`] }
  );
}

// ─── Discover ────────────────────────────────────────────────────────────────

export function discoverMovies(
  params: DiscoverMovieParams = {}
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/discover/movie',
    params as Record<string, string | number | boolean | undefined>,
    { revalidate: 3600, tags: ['discover', 'movies'] }
  );
}

export function discoverTV(
  params: DiscoverTVParams = {}
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    '/discover/tv',
    params as Record<string, string | number | boolean | undefined>,
    { revalidate: 3600, tags: ['discover', 'tv'] }
  );
}

// ─── Search ──────────────────────────────────────────────────────────────────

export function searchMulti(
  query: string,
  page = 1
): Promise<TMDBPaginatedResponse<SearchMultiResult>> {
  return tmdbFetch<TMDBPaginatedResponse<SearchMultiResult>>(
    '/search/multi',
    { query, page, include_adult: false },
    { revalidate: 300, tags: ['search'] }
  );
}

export function searchMovies(
  query: string,
  page = 1
): Promise<TMDBPaginatedResponse<Movie>> {
  return tmdbFetch<TMDBPaginatedResponse<Movie>>(
    '/search/movie',
    { query, page, include_adult: false },
    { revalidate: 300, tags: ['search', 'movies'] }
  );
}

export function searchTV(
  query: string,
  page = 1
): Promise<TMDBPaginatedResponse<TVShow>> {
  return tmdbFetch<TMDBPaginatedResponse<TVShow>>(
    '/search/tv',
    { query, page, include_adult: false },
    { revalidate: 300, tags: ['search', 'tv'] }
  );
}

// ─── Release Dates (for content certification) ───────────────────────────────

export function getMovieReleaseDates(id: number): Promise<MovieReleaseDates> {
  return tmdbFetch<MovieReleaseDates>(
    `/movie/${id}/release_dates`,
    {},
    { revalidate: 86400, tags: [`movie-${id}`, `movie-${id}-release-dates`] }
  );
}
