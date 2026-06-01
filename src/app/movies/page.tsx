import { Suspense } from 'react';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
} from '@/lib/tmdb';
import Hero from '@/components/home/Hero';
import MovieRow from '@/components/movie/MovieRow';
import RowSkeleton from '@/components/home/RowSkeleton';
import PageShell from '@/components/layout/PageShell';
import type { Movie } from '@/types/movie';

export const revalidate = 3600;

export default async function MoviesPage() {
  const [
    trendingRes,
    popularRes,
    topRatedRes,
    nowPlayingRes,
    upcomingRes,
  ] = await Promise.all([
    getTrendingMovies('week'),
    getPopularMovies(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
    getUpcomingMovies(),
  ]);

  const tagMovies = (movies: Movie[]): Movie[] =>
    movies.map((m) => ({ ...m, media_type: 'movie' as const }));

  const trending = tagMovies(trendingRes.results.slice(0, 20));
  const popular = tagMovies(popularRes.results.slice(0, 20));
  const topRated = tagMovies(topRatedRes.results.slice(0, 20));
  const nowPlaying = tagMovies(nowPlayingRes.results.slice(0, 20));
  const upcoming = tagMovies(upcomingRes.results.slice(0, 20));

  const heroMovie = trending[0];
  const heroCarouselItems = trending.slice(1, 5);

  return (
    <>
      {heroMovie && (
        <Hero
          media={heroMovie}
          items={heroCarouselItems}
          cycleMs={8000}
        />
      )}

      <PageShell noTopPad>
        <div className="space-y-10 md:space-y-14 pt-6 md:pt-10">
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Trending Movies"
              media={trending}
              seeAllHref="/search?type=movie&sort=popularity.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Popular on DhobiFlix"
              media={popular}
              seeAllHref="/search?type=movie&sort=popularity.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Now Playing in Theatres"
              media={nowPlaying}
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Top Rated Movies"
              media={topRated}
              seeAllHref="/search?type=movie&sort=vote_average.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Upcoming Releases"
              media={upcoming}
            />
          </Suspense>
        </div>
      </PageShell>
    </>
  );
}
