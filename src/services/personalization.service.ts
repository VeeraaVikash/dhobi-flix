import type { Movie, TVShow } from '@/types/movie';
import type { Profile, WatchHistoryEntry } from '@/types/profile';
import { RECOMMENDATION, MATURITY_RATING_ORDER } from '@/constants/app';

export interface ScoredMedia {
  score: number;
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

/**
 * Score a movie for a given profile.
 * Genre affinity × 0.4 + vote_average × 0.35 + normalised popularity × 0.25
 */
export function scoreMovie(movie: Movie, genreAffinity: Map<number, number>): number {
  const genreScore =
    movie.genre_ids.reduce((sum, id) => sum + (genreAffinity.get(id) ?? 0), 0) /
    Math.max(movie.genre_ids.length, 1);

  const ratingScore = movie.vote_average / 10;
  const popularityScore = Math.min(movie.popularity / 1000, 1);

  return (
    genreScore * RECOMMENDATION.GENRE_AFFINITY_WEIGHT +
    ratingScore * RECOMMENDATION.RATING_WEIGHT +
    popularityScore * RECOMMENDATION.POPULARITY_WEIGHT
  );
}

/** Score a TV show for a given profile. Same formula as scoreMovie. */
export function scoreTVShow(show: TVShow, genreAffinity: Map<number, number>): number {
  const genreScore =
    show.genre_ids.reduce((sum, id) => sum + (genreAffinity.get(id) ?? 0), 0) /
    Math.max(show.genre_ids.length, 1);

  const ratingScore = show.vote_average / 10;
  const popularityScore = Math.min(show.popularity / 1000, 1);

  return (
    genreScore * RECOMMENDATION.GENRE_AFFINITY_WEIGHT +
    ratingScore * RECOMMENDATION.RATING_WEIGHT +
    popularityScore * RECOMMENDATION.POPULARITY_WEIGHT
  );
}

/** Sort scored items descending by score, return top `limit`. */
export function rankResults(results: ScoredMedia[], limit: number): ScoredMedia[] {
  return [...results].sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Return watch-history entries that are between MIN_PROGRESS (5%) and MAX_PROGRESS (95%)
 * and were watched in the last 30 days — i.e., candidates for Continue Watching.
 */
export function getContinueWatching(
  history: WatchHistoryEntry[],
  maxItems = RECOMMENDATION.CONTINUE_WATCHING_MAX
): WatchHistoryEntry[] {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return history
    .filter((entry) => {
      const progress = entry.progressSeconds / entry.durationSeconds;
      const withinWindow = progress >= 0.05 && progress <= 0.95;
      const recentEnough = new Date(entry.watchedAt).getTime() >= thirtyDaysAgo;
      return withinWindow && recentEnough && !entry.completed;
    })
    .sort(
      (a, b) =>
        new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
    )
    .slice(0, maxItems);
}

/** Build a display title for a content row based on genre name. */
export function buildRowTitle(genreName: string): string {
  return `Because You Like ${genreName}`;
}

/** Shuffle an array using Fisher-Yates, then return top `limit` items. */
export function getPersonalizedShuffle<T>(items: T[], limit: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, limit);
}

/** Return true if the media's maturity rating is within the profile's allowed ceiling. */
export function passesMaturityFilter(
  mediaRating: string,
  profile: Profile
): boolean {
  const allowedOrder = MATURITY_RATING_ORDER[profile.preferences.maturityRating as keyof typeof MATURITY_RATING_ORDER] ?? 0;
  const mediaOrder = MATURITY_RATING_ORDER[mediaRating as keyof typeof MATURITY_RATING_ORDER];
  if (mediaOrder === undefined) return true; // unknown rating — don't block
  return mediaOrder <= allowedOrder;
}

/**
 * Build a map of genreId → affinity score (0–1) from available profile signals:
 *
 * 1. `preferences.preferredGenreIds` → base affinity 0.8 each (explicit preference)
 * 2. High user ratings (4–5 ★) on specific media cannot contribute genre affinity here
 *    because WatchHistoryEntry/Rating don't carry genre_ids — that join requires a
 *    separate media-metadata lookup (TODO for Phase 2).
 *
 * Returns an empty map for profiles with no stated genre preferences, which
 * causes the scorer to fall back to vote_average + popularity.
 */
export function getGenreAffinity(profile: Profile): Map<number, number> {
  const affinityMap = new Map<number, number>();

  const preferred = profile.preferences.preferredGenreIds ?? [];
  for (const genreId of preferred) {
    affinityMap.set(genreId, 0.8);
  }

  return affinityMap;
}
