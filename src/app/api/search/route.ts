export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';
import { sanitizeQuery, isValidQuery, applyFilters, sortByRelevance, getSuggestions } from '@/services/search.service';
import type { SearchFilters } from '@/services/search.service';
import { HTTP_STATUS, PAGINATION } from '@/constants/app';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const raw = searchParams.get('query') ?? searchParams.get('q') ?? '';
  const query = sanitizeQuery(raw);

  if (!isValidQuery(query)) {
    return NextResponse.json(
      { error: 'Query must be between 2 and 100 characters' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const typeParam = searchParams.get('type');
  const minRatingParam = searchParams.get('minRating');
  const yearParam = searchParams.get('year');
  const language = searchParams.get('language') ?? undefined;

  const filters: SearchFilters = {
    type: typeParam === 'movie' || typeParam === 'tv' ? typeParam : 'all',
    minRating: minRatingParam ? parseFloat(minRatingParam) : undefined,
    year: yearParam ? parseInt(yearParam, 10) : undefined,
    language,
  };

  try {
    const tmdbResults = await searchMulti(query, page);
    const filtered = applyFilters(tmdbResults.results, filters);
    const sorted = sortByRelevance(filtered);

    const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);
    const suggestions = getSuggestions(tmdbResults.results);

    const response = NextResponse.json({
      results: paginated,
      suggestions,
      totalResults: sorted.length,
      totalPages: Math.ceil(sorted.length / pageSize),
      page,
      query,
      filters,
    });

    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return response;
  } catch (err) {
    console.error('[search] TMDB error:', err);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
