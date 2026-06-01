import type { Metadata } from 'next';
import { searchMulti, discoverMovies, discoverTV } from '@/lib/tmdb';
import SearchPageClient from './SearchPageClient';
import type { Movie, TVShow, SearchMultiResult, SortOption } from '@/types/movie';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for movies, TV shows, and people on DhobiFlix.',
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    genre?: string;
    sort?: string;
    lang?: string;
    rating?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? '';
  const page = parseInt(params.page ?? '1', 10);
  const hasDiscoverParams = Boolean(
    params.type ||
      params.sort ||
      params.genre ||
      params.lang ||
      params.rating ||
      (!query && !params.page)
  );

  let results: (Movie | TVShow)[] = [];
  let totalPages = 1;
  let totalResults = 0;

  if (query.length >= 2) {
    // Text search
    const data = await searchMulti(query, page);
    results = data.results
      .filter((item): item is Movie | TVShow =>
        item.media_type === 'movie' || item.media_type === 'tv'
      );
    totalPages = data.total_pages;
    totalResults = results.length;
  } else if (hasDiscoverParams) {
    // Discover mode
    const type = params.type ?? 'movie';
    const sortBy = (params.sort ?? 'popularity.desc') as SortOption;
    const language = params.lang && params.lang !== 'all' ? params.lang : undefined;
    const rating = params.rating ? parseFloat(params.rating) : undefined;

    if (type === 'tv') {
      const data = await discoverTV({
        page,
        sort_by: sortBy,
        with_genres: params.genre,
        with_original_language: language,
        'vote_average.gte': rating,
      });
      results = data.results.map((s) => ({ ...s, media_type: 'tv' as const }));
      totalPages = data.total_pages;
      totalResults = data.total_results;
    } else {
      const data = await discoverMovies({
        page,
        sort_by: sortBy,
        with_genres: params.genre,
        with_original_language: language,
        'vote_average.gte': rating,
      });
      results = data.results.map((m) => ({ ...m, media_type: 'movie' as const }));
      totalPages = data.total_pages;
      totalResults = data.total_results;
    }
  }

  return (
    <SearchPageClient
      initialResults={results}
      initialQuery={query}
      totalPages={totalPages}
      totalResults={totalResults}
      currentPage={page}
    />
  );
}
