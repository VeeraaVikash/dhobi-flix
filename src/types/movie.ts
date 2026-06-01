// ─── Primitive Unions ────────────────────────────────────────────────────────

export type MediaType = 'movie' | 'tv' | 'person';

export type SortOption =
  | 'popularity.desc'
  | 'popularity.asc'
  | 'vote_average.desc'
  | 'vote_average.asc'
  | 'release_date.desc'
  | 'release_date.asc'
  | 'revenue.desc'
  | 'primary_release_date.desc'
  | 'first_air_date.desc'
  | 'original_title.asc';

// ─── Genre ───────────────────────────────────────────────────────────────────

export interface Genre {
  id: number;
  name: string;
}

// ─── Shared Base ─────────────────────────────────────────────────────────────

export interface BaseMedia {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  adult: boolean;
}

// ─── Movie ───────────────────────────────────────────────────────────────────

export interface Movie extends BaseMedia {
  media_type: 'movie';
  title: string;
  original_title: string;
  release_date: string;
  runtime?: number;
  revenue?: number;
  budget?: number;
  status?: string;
  tagline?: string;
  genres?: Genre[];
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
}

// ─── TV Show ─────────────────────────────────────────────────────────────────

export interface TVShow extends BaseMedia {
  media_type: 'tv';
  name: string;
  original_name: string;
  first_air_date: string;
  last_air_date?: string;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  genres?: Genre[];
  seasons?: TVSeason[];
  in_production?: boolean;
  networks?: Network[];
}

export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface Credits {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideosResult {
  id: number;
  results: Video[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface PersonResult {
  id: number;
  name: string;
  media_type: 'person';
  popularity: number;
  profile_path: string | null;
  known_for_department: string;
  known_for: (Movie | TVShow)[];
  adult: boolean;
}

export type SearchMultiResult = (Movie | TVShow | PersonResult) & {
  media_type: MediaType;
};

// ─── Release Dates ───────────────────────────────────────────────────────────

export interface MovieReleaseDates {
  id: number;
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      release_date: string;
      type: number;
    }>;
  }>;
}

// ─── TV Episode ──────────────────────────────────────────────────────────────

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Crew[];
  guest_stars: Cast[];
}

// ─── Discover Params ─────────────────────────────────────────────────────────

export interface DiscoverMovieParams {
  page?: number;
  sort_by?: SortOption;
  with_genres?: string;
  without_genres?: string;
  with_original_language?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  'vote_count.gte'?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  region?: string;
  include_adult?: boolean;
}

export interface DiscoverTVParams {
  page?: number;
  sort_by?: SortOption;
  with_genres?: string;
  without_genres?: string;
  with_original_language?: string;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
  with_status?: string;
  with_networks?: number;
  include_null_first_air_dates?: boolean;
}
