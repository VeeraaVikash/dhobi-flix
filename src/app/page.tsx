import { Suspense } from 'react';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTV,
  getTrendingTV,
} from '@/lib/tmdb';
import Hero from '@/components/home/Hero';
import MovieRow from '@/components/movie/MovieRow';
import RowSkeleton from '@/components/home/RowSkeleton';
import PageShell from '@/components/layout/PageShell';
import type { Movie, TVShow } from '@/types/movie';

export const revalidate = 3600; // ISR — re-generate every hour

export default async function HomePage() {
  const [
    trendingRes,
    popularRes,
    topRatedRes,
    nowPlayingRes,
    upcomingRes,
    popularTVRes,
    trendingTVRes,
  ] = await Promise.all([
    getTrendingMovies('week'),
    getPopularMovies(),
    getTopRatedMovies(),
    getNowPlayingMovies(),
    getUpcomingMovies(),
    getPopularTV(),
    getTrendingTV('week'),
  ]);

  // Tag results with media_type since TMDB trending already includes it,
  // but other endpoints do not.
  const tagMovies = (movies: Movie[]): Movie[] =>
    movies.map((m) => ({ ...m, media_type: 'movie' as const }));

  const tagTV = (shows: TVShow[]): TVShow[] =>
    shows.map((s) => ({ ...s, media_type: 'tv' as const }));

  const trending = tagMovies(trendingRes.results.slice(0, 20));
  const popular = tagMovies(popularRes.results.slice(0, 20));
  const topRated = tagMovies(topRatedRes.results.slice(0, 20));
  const nowPlaying = tagMovies(nowPlayingRes.results.slice(0, 20));
  const upcoming = tagMovies(upcomingRes.results.slice(0, 20));
  const popularTV = tagTV(popularTVRes.results.slice(0, 20));
  const trendingTV = tagTV(trendingTVRes.results.slice(0, 20));

  const heroMovie = trending[0];
  const heroCarouselItems = trending.slice(1, 5);

  return (
    <>
      {/* Full-bleed Hero Banner */}
      {heroMovie && (
        <Hero
          media={heroMovie}
          items={heroCarouselItems}
          cycleMs={8000}
        />
      )}

      <PageShell noTopPad>
        <div className="space-y-10 md:space-y-14 pt-6 md:pt-10">
          {/* Trending Movies */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Trending Now"
              media={trending}
              seeAllHref="/search?sort=popularity.desc"
            />
          </Suspense>

          {/* Popular TV Shows */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Popular TV Shows"
              media={popularTV}
              seeAllHref="/search?type=tv&sort=popularity.desc"
            />
          </Suspense>

          {/* Now Playing */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Now Playing in Theatres"
              media={nowPlaying}
            />
          </Suspense>

          {/* Top Rated */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Top Rated"
              subtitle="Highest rated movies of all time"
              media={topRated}
              seeAllHref="/search?sort=vote_average.desc"
            />
          </Suspense>

          {/* Trending TV */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Trending TV This Week"
              media={trendingTV}
            />
          </Suspense>

          {/* Upcoming */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Upcoming Releases"
              media={upcoming}
            />
          </Suspense>

          {/* Popular Movies */}
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Popular on DhobiFlix"
              media={popular}
              seeAllHref="/search?sort=popularity.desc"
            />
          </Suspense>
        </div>
      </PageShell>
    </>
  );
}
