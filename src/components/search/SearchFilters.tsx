'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { MOVIE_GENRES, TV_GENRES } from '@/constants/genres';
import { cn } from '@/lib/utils';
import type { MediaType, SortOption } from '@/types/movie';
import type { Language } from '@/types/profile';

export interface SearchFilterState {
  mediaType: 'all' | 'movie' | 'tv';
  genreIds: number[];
  language: Language | 'all';
  sortBy: SortOption;
  minRating: number;
}

interface SearchFiltersProps {
  filters: SearchFilterState;
  onChange: (next: SearchFilterState) => void;
  className?: string;
}

const MEDIA_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity.desc', label: 'Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'primary_release_date.desc', label: 'Release Date' },
  { value: 'original_title.asc', label: 'A–Z' },
];

const LANGUAGE_OPTIONS: { value: Language | 'all'; label: string }[] = [
  { value: 'all', label: 'All Languages' },
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'kn', label: 'Kannada' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
];

const RATING_OPTIONS = [0, 6, 7, 8, 9].map((v) => ({
  value: v,
  label: v === 0 ? 'Any Rating' : `${v}+`,
}));

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex-shrink-0',
        active
          ? 'bg-[#e50914] text-white'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
      )}
    >
      {label}
    </motion.button>
  );
}

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const DEFAULT_FILTERS: SearchFilterState = {
  mediaType: 'all',
  genreIds: [],
  language: 'all',
  sortBy: 'popularity.desc',
  minRating: 0,
};

function hasChanged(filters: SearchFilterState): boolean {
  return (
    filters.mediaType !== DEFAULT_FILTERS.mediaType ||
    filters.genreIds.length > 0 ||
    filters.language !== DEFAULT_FILTERS.language ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.minRating !== DEFAULT_FILTERS.minRating
  );
}

export default function SearchFilters({ filters, onChange, className }: SearchFiltersProps) {
  const genres =
    filters.mediaType === 'tv'
      ? TV_GENRES
      : filters.mediaType === 'movie'
      ? MOVIE_GENRES
      : MOVIE_GENRES;

  const toggleGenre = (id: number) => {
    const next = filters.genreIds.includes(id)
      ? filters.genreIds.filter((g) => g !== id)
      : [...filters.genreIds, id];
    onChange({ ...filters, genreIds: next });
  };

  const reset = () => onChange({ ...DEFAULT_FILTERS });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn('space-y-5 overflow-hidden', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold">
          <SlidersHorizontal size={15} className="text-[#e50914]" />
          Filters
        </div>
        {hasChanged(filters) && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Media Type */}
      <FilterGroup label="Type">
        {MEDIA_TYPE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.mediaType === value}
            onClick={() => onChange({ ...filters, mediaType: value, genreIds: [] })}
          />
        ))}
      </FilterGroup>

      {/* Sort */}
      <FilterGroup label="Sort by">
        {SORT_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.sortBy === value}
            onClick={() => onChange({ ...filters, sortBy: value })}
          />
        ))}
      </FilterGroup>

      {/* Language */}
      <FilterGroup label="Language">
        {LANGUAGE_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.language === value}
            onClick={() => onChange({ ...filters, language: value })}
          />
        ))}
      </FilterGroup>

      {/* Rating */}
      <FilterGroup label="Min. Rating">
        {RATING_OPTIONS.map(({ value, label }) => (
          <Chip
            key={value}
            label={label}
            active={filters.minRating === value}
            onClick={() => onChange({ ...filters, minRating: value })}
          />
        ))}
      </FilterGroup>

      {/* Genres */}
      <FilterGroup label="Genres">
        {genres.map((g) => (
          <Chip
            key={g.id}
            label={g.name}
            active={filters.genreIds.includes(g.id)}
            onClick={() => toggleGenre(g.id)}
          />
        ))}
      </FilterGroup>
    </motion.div>
  );
}

export { DEFAULT_FILTERS };
