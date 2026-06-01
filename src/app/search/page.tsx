import type { Metadata } from 'next';
import { searchMulti, discoverMovies, discoverTV } from '@/lib/tmdb';
import SearchPageClient from './SearchPageClient';
import type { Movie, TVShow, SearchMultiResult } from '@/types/movie';

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

  let results: (Movie | TVShow | SearchMultiResult)[] = [];
  let totalPages = 1;
  let totalResults = 0;

  if (query.length >= 2) {
    // Text search
    const data = await searchMulti(query, page);
    results = data.results;
    totalPages = data.total_pages;
    totalResults = data.total_results;
  } else if (params.sort || params.genre || params.lang) {
    // Discover mode
    const type = params.type ?? 'movie';
    if (type === 'tv') {
      const data = await discoverTV({
        page,
        sort_by: (params.sort ?? 'popularity.desc') as 'popularity.desc',
        with_genres: params.genre,
        with_original_language: params.lang !== 'all' ? params.lang : undefined,
        'vote_average.gte': params.rating ? parseFloat(params.rating) : undefined,
      });
      results = data.results.map((s) => ({ ...s, media_type: 'tv' as const }));
      totalPages = data.total_pages;
      totalResults = data.total_results;
    } else {
      const data = await discoverMovies({
        page,
        sort_by: (params.sort ?? 'popularity.desc') as 'popularity.desc',
        with_genres: params.genre,
        with_original_language: params.lang !== 'all' ? params.lang : undefined,
        'vote_average.gte': params.rating ? parseFloat(params.rating) : undefined,
      });
      results = data.results.map((m) => ({ ...m, media_type: 'movie' as const }));
      totalPages = data.total_pages;
      totalResults = data.total_results;
    }
  }

  return (
    <SearchPageClient
      initialResults={results as (Movie | TVShow)[]}
      initialQuery={query}
      totalPages={totalPages}
      totalResults={totalResults}
      currentPage={page}
    />
  );
}
