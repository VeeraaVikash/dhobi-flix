import { Suspense } from 'react';
import {
  getPopularTV,
  getTrendingTV,
  getTopRatedTV,
  getAiringTodayTV,
} from '@/lib/tmdb';
import Hero from '@/components/home/Hero';
import MovieRow from '@/components/movie/MovieRow';
import RowSkeleton from '@/components/home/RowSkeleton';
import PageShell from '@/components/layout/PageShell';
import type { TVShow } from '@/types/movie';

export const revalidate = 3600;

export default async function TVPage() {
  const [
    trendingRes,
    popularRes,
    topRatedRes,
    airingTodayRes,
  ] = await Promise.all([
    getTrendingTV('week'),
    getPopularTV(),
    getTopRatedTV(),
    getAiringTodayTV(),
  ]);

  const tagTV = (shows: TVShow[]): TVShow[] =>
    shows.map((s) => ({ ...s, media_type: 'tv' as const }));

  const trending = tagTV(trendingRes.results.slice(0, 20));
  const popular = tagTV(popularRes.results.slice(0, 20));
  const topRated = tagTV(topRatedRes.results.slice(0, 20));
  const airingToday = tagTV(airingTodayRes.results.slice(0, 20));

  const heroShow = trending[0];
  const heroCarouselItems = trending.slice(1, 5);

  return (
    <>
      {heroShow && (
        <Hero
          media={heroShow}
          items={heroCarouselItems}
          cycleMs={8000}
        />
      )}

      <PageShell noTopPad>
        <div className="space-y-10 md:space-y-14 pt-6 md:pt-10">
          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Trending TV Shows"
              media={trending}
              seeAllHref="/search?type=tv&sort=popularity.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Popular on DhobiFlix"
              media={popular}
              seeAllHref="/search?type=tv&sort=popularity.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Top Rated TV Shows"
              media={topRated}
              seeAllHref="/search?type=tv&sort=vote_average.desc"
            />
          </Suspense>

          <Suspense fallback={<RowSkeleton />}>
            <MovieRow
              title="Airing Today"
              media={airingToday}
            />
          </Suspense>
        </div>
      </PageShell>
    </>
  );
}
