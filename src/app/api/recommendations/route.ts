export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getTrendingMovies,
  getTrendingTV,
  getMovieRecommendations,
  getTVRecommendations,
} from '@/lib/tmdb';
import { getMockProfileById } from '@/data/mockProfiles';
import {
  scoreMovie,
  scoreTVShow,
  rankResults,
  getContinueWatching,
  getGenreAffinity,
} from '@/services/personalization.service';
import { HTTP_STATUS, RECOMMENDATION } from '@/constants/app';
import type { ScoredMedia } from '@/services/personalization.service';
import type { Movie, TVShow } from '@/types/movie';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const profileId = searchParams.get('profileId');
  if (!profileId) {
    return NextResponse.json(
      { error: 'profileId is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const profile = getMockProfileById(profileId);
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  const seedMediaId = searchParams.get('seedMediaId')
    ? parseInt(searchParams.get('seedMediaId')!, 10)
    : undefined;
  const seedMediaType = searchParams.get('seedMediaType') as 'movie' | 'tv' | null;
  const limit = Math.min(
    parseInt(searchParams.get('limit') ?? String(RECOMMENDATION.DEFAULT_LIMIT), 10),
    RECOMMENDATION.MAX_LIMIT
  );

  try {
    const genreAffinity = getGenreAffinity(profile);
    const scored: ScoredMedia[] = [];

    // Seed-based recommendations
    if (seedMediaId && seedMediaType) {
      const seedRecs =
        seedMediaType === 'movie'
          ? await getMovieRecommendations(seedMediaId)
          : await getTVRecommendations(seedMediaId);

      seedRecs.results.forEach((item) => {
        const score =
          seedMediaType === 'movie'
            ? scoreMovie(item as Movie, genreAffinity)
            : scoreTVShow(item as TVShow, genreAffinity);
        scored.push({ score, mediaId: item.id, mediaType: seedMediaType });
      });
    }

    // Trending fallback — fetch movies and TV separately (tmdb.ts has no getTrending('all'))
    if (scored.length < limit) {
      const [trendingMovies, trendingTV] = await Promise.all([
        getTrendingMovies('week'),
        getTrendingTV('week'),
      ]);

      trendingMovies.results.forEach((movie) => {
        scored.push({
          score: scoreMovie(movie, genreAffinity),
          mediaId: movie.id,
          mediaType: 'movie',
        });
      });

      trendingTV.results.forEach((show) => {
        scored.push({
          score: scoreTVShow(show, genreAffinity),
          mediaId: show.id,
          mediaType: 'tv',
        });
      });
    }

    const ranked = rankResults(scored, limit);
    const continueWatching = getContinueWatching(profile.watchHistory);

    return NextResponse.json({
      recommendations: ranked,
      continueWatching,
      profileId,
    });
  } catch (err) {
    console.error('[recommendations] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
