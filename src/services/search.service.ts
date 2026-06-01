import type { SearchMultiResult } from '@/types/movie';
import { SEARCH } from '@/constants/app';

export interface SearchFilters {
  type?: 'movie' | 'tv' | 'all';
  minRating?: number;
  year?: number;
  language?: string;
}

export interface SearchResult {
  results: SearchMultiResult[];
  totalResults: number;
  totalPages: number;
  page: number;
  query: string;
  filters: SearchFilters;
}

export interface SearchSuggestion {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv' | 'person';
  posterPath: string | null;
  year?: string;
}

/** Strip leading/trailing whitespace and collapse internal whitespace. */
export function sanitizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/** Return true if the query passes length constraints. */
export function isValidQuery(query: string): boolean {
  return (
    query.length >= SEARCH.MIN_QUERY_LENGTH && query.length <= SEARCH.MAX_QUERY_LENGTH
  );
}

/** Apply client-side filters to TMDB results. */
export function applyFilters(
  results: SearchMultiResult[],
  filters: SearchFilters
): SearchMultiResult[] {
  return results.filter((item) => {
    if (filters.type && filters.type !== 'all') {
      if (item.media_type !== filters.type) return false;
    }

    if (filters.minRating !== undefined && item.media_type !== 'person') {
      const rating = 'vote_average' in item ? item.vote_average : 0;
      if (rating < filters.minRating) return false;
    }

    if (filters.year !== undefined && item.media_type !== 'person') {
      const dateStr =
        'release_date' in item ? item.release_date : 'first_air_date' in item ? item.first_air_date : '';
      if (!dateStr?.startsWith(String(filters.year))) return false;
    }

    if (filters.language !== undefined && item.media_type !== 'person') {
      const lang = 'original_language' in item ? item.original_language : undefined;
      if (lang && lang !== filters.language) return false;
    }

    return true;
  });
}

/** Sort by vote_average desc, then popularity desc. Persons go to the end. */
export function sortByRelevance(results: SearchMultiResult[]): SearchMultiResult[] {
  return [...results].sort((a, b) => {
    if (a.media_type === 'person' && b.media_type !== 'person') return 1;
    if (a.media_type !== 'person' && b.media_type === 'person') return -1;

    const ratingA = 'vote_average' in a ? a.vote_average : 0;
    const ratingB = 'vote_average' in b ? b.vote_average : 0;
    if (ratingB !== ratingA) return ratingB - ratingA;

    const popA = 'popularity' in a ? a.popularity : 0;
    const popB = 'popularity' in b ? b.popularity : 0;
    return popB - popA;
  });
}

/** Execute a search: sanitize → validate → apply filters → sort → paginate. */
export function executeSearch(
  rawResults: SearchMultiResult[],
  rawQuery: string,
  filters: SearchFilters,
  page: number
): SearchResult {
  const query = sanitizeQuery(rawQuery);
  const filtered = applyFilters(rawResults, filters);
  const sorted = sortByRelevance(filtered);

  const pageSize = SEARCH.DEFAULT_PAGE_SIZE;
  const start = (page - 1) * pageSize;
  const paginated = sorted.slice(start, start + pageSize);

  return {
    results: paginated,
    totalResults: sorted.length,
    totalPages: Math.ceil(sorted.length / pageSize),
    page,
    query,
    filters,
  };
}

/** Build autocomplete suggestions from search results. */
export function getSuggestions(results: SearchMultiResult[]): SearchSuggestion[] {
  return results.slice(0, SEARCH.MAX_SUGGESTIONS).map((item): SearchSuggestion => {
    if (item.media_type === 'person') {
      return {
        id: item.id,
        title: item.name,
        mediaType: 'person',
        posterPath: item.profile_path ?? null,
      };
    }
    if (item.media_type === 'movie') {
      return {
        id: item.id,
        title: item.title,
        mediaType: 'movie',
        posterPath: item.poster_path ?? null,
        year: item.release_date?.slice(0, 4),
      };
    }
    return {
      id: item.id,
      title: item.name,
      mediaType: 'tv',
      posterPath: item.poster_path ?? null,
      year: item.first_air_date?.slice(0, 4),
    };
  });
}

/** Merge two result arrays, de-duplicating by id+media_type. Second wins on conflict. */
export function mergeSearchResults(
  primary: SearchMultiResult[],
  secondary: SearchMultiResult[]
): SearchMultiResult[] {
  const map = new Map<string, SearchMultiResult>();
  [...primary, ...secondary].forEach((item) => {
    map.set(`${item.media_type}-${item.id}`, item);
  });
  return Array.from(map.values());
}
