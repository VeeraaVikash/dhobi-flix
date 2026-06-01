'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBox from '@/components/search/SearchBox';
import SearchFilters, {
  DEFAULT_FILTERS,
} from '@/components/search/SearchFilters';
import type { SearchFilterState } from '@/components/search/SearchFilters';
import MovieGrid from '@/components/movie/MovieGrid';
import PageShell from '@/components/layout/PageShell';
import type { Movie, TVShow } from '@/types/movie';

interface SearchPageClientProps {
  initialResults: (Movie | TVShow)[];
  initialQuery: string;
  totalPages: number;
  totalResults: number;
  currentPage: number;
}

export default function SearchPageClient({
  initialResults,
  initialQuery,
  totalPages,
  totalResults,
  currentPage,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilterState>({
    ...DEFAULT_FILTERS,
    mediaType: (searchParams.get('type') as SearchFilterState['mediaType']) ?? 'all',
  });

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (filters.mediaType !== 'all') params.set('type', filters.mediaType);
      if (filters.sortBy !== 'popularity.desc') params.set('sort', filters.sortBy);
      if (filters.language !== 'all') params.set('lang', filters.language);
      if (filters.minRating > 0) params.set('rating', String(filters.minRating));
      if (filters.genreIds.length > 0) params.set('genre', filters.genreIds.join(','));
      router.push(`/search?${params.toString()}`);
    },
    [router, filters]
  );

  const handleFilterChange = useCallback(
    (next: SearchFilterState) => {
      setFilters(next);
      // Re-trigger search with new filters
      const params = new URLSearchParams();
      const query = searchParams.get('q') ?? '';
      if (query) params.set('q', query);
      if (next.mediaType !== 'all') params.set('type', next.mediaType);
      if (next.sortBy !== 'popularity.desc') params.set('sort', next.sortBy);
      if (next.language !== 'all') params.set('lang', next.language);
      if (next.minRating > 0) params.set('rating', String(next.minRating));
      if (next.genreIds.length > 0) params.set('genre', next.genreIds.join(','));
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <PageShell>
      <div className="space-y-6 pt-4 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">
            {initialQuery ? `Results for "${initialQuery}"` : 'Explore'}
          </h1>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>
        </div>

        {/* Search Box */}
        <SearchBox
          onSearch={handleSearch}
          value={initialQuery}
          size="lg"
          autoFocus={!initialQuery}
        />

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <SearchFilters
              filters={filters}
              onChange={handleFilterChange}
            />
          )}
        </AnimatePresence>

        {/* Result Count */}
        {totalResults > 0 && (
          <p className="text-zinc-500 text-sm">
            {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Results Grid */}
        <MovieGrid
          media={initialResults}
          emptyMessage={
            initialQuery
              ? `No results for "${initialQuery}". Try a different search.`
              : 'Start searching or use filters to discover content.'
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 pt-6 pb-4"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span className="text-zinc-500 text-sm font-mono">
              {currentPage} / {Math.min(totalPages, 500)}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </PageShell>
  );
}
