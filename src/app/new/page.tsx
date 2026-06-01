import { Suspense } from 'react';
import { discoverMovies, discoverTV } from '@/lib/tmdb';
import PageShell, { SectionHeader } from '@/components/layout/PageShell';
import MovieGrid from '@/components/movie/MovieGrid';
import type { Movie, TVShow } from '@/types/movie';

export const revalidate = 3600;

export default async function NewAndPopularPage() {
  const [moviesRes, tvRes] = await Promise.all([
    discoverMovies({
      sort_by: 'primary_release_date.desc',
      'primary_release_date.lte': new Date().toISOString().split('T')[0],
      'vote_count.gte': 50, // To avoid obscure entries
    }),
    discoverTV({
      sort_by: 'first_air_date.desc',
      'first_air_date.lte': new Date().toISOString().split('T')[0],
      'vote_count.gte': 50,
    }),
  ]);

  const tagMovies = (movies: Movie[]): Movie[] =>
    movies.map((m) => ({ ...m, media_type: 'movie' as const }));

  const tagTV = (shows: TVShow[]): TVShow[] =>
    shows.map((s) => ({ ...s, media_type: 'tv' as const }));

  const movies = tagMovies(moviesRes.results);
  const tvShows = tagTV(tvRes.results);

  // Combine and sort by date descending
  const combined = [...movies, ...tvShows].sort((a, b) => {
    const dateA = a.media_type === 'movie' ? (a as Movie).release_date : (a as TVShow).first_air_date;
    const dateB = b.media_type === 'movie' ? (b as Movie).release_date : (b as TVShow).first_air_date;
    
    const timeA = dateA ? new Date(dateA).getTime() : 0;
    const timeB = dateB ? new Date(dateB).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <PageShell>
      <div className="pt-4">
        <SectionHeader title="New & Popular" />
        <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading new releases...</div>}>
          <MovieGrid media={combined} />
        </Suspense>
      </div>
    </PageShell>
  );
}
