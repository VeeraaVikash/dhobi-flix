'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, User, TrendingUp, ArrowUpRight } from 'lucide-react';
import { getPosterUrl, getProfileUrl } from '@/lib/image';
import { cn, formatYear, truncateText } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import type { SearchMultiResult, Movie, TVShow, PersonResult } from '@/types/movie';

interface TypeaheadResultsProps {
  results: SearchMultiResult[];
  query: string;
  isLoading?: boolean;
  isOpen: boolean;
  onSelect?: (result: SearchMultiResult) => void;
  /** Called when the user wants to see all results */
  onViewAll?: (query: string) => void;
  className?: string;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-transparent text-[#e50914] font-bold not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

function ResultItem({
  result,
  query,
  onSelect,
}: {
  result: SearchMultiResult;
  query: string;
  onSelect?: (r: SearchMultiResult) => void;
}) {
  let title = '';
  let year = '';
  let subtitle = '';
  let posterPath: string | null = null;
  let href = '';
  let Icon: React.ElementType = Film;

  if (result.media_type === 'movie') {
    const m = result as Movie;
    title = m.title;
    year = m.release_date ? formatYear(m.release_date) : '';
    subtitle = m.overview ? truncateText(m.overview, 60) : '';
    posterPath = m.poster_path;
    href = ROUTES.MOVIE(m.id);
    Icon = Film;
  } else if (result.media_type === 'tv') {
    const tv = result as TVShow;
    title = tv.name;
    year = tv.first_air_date ? formatYear(tv.first_air_date) : '';
    subtitle = tv.overview ? truncateText(tv.overview, 60) : '';
    posterPath = tv.poster_path;
    href = ROUTES.TV(tv.id);
    Icon = Tv;
  } else {
    const p = result as PersonResult;
    title = p.name;
    subtitle = p.known_for_department;
    posterPath = p.profile_path;
    href = `/person/${p.id}`;
    Icon = User;
  }

  const thumbUrl =
    result.media_type === 'person'
      ? getProfileUrl((result as PersonResult).profile_path, 'w185')
      : getPosterUrl(posterPath, 'w92');

  return (
    <Link
      href={href}
      onClick={() => onSelect?.(result)}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors group/item"
    >
      {/* Thumbnail */}
      <div className="w-10 h-14 rounded-sm overflow-hidden bg-zinc-800 flex-shrink-0 relative">
        {posterPath ? (
          <Image
            src={thumbUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={14} className="text-zinc-600" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-medium leading-tight line-clamp-1">
            <HighlightMatch text={title} query={query} />
          </p>
          <Icon size={11} className="text-zinc-600 flex-shrink-0" />
        </div>
        <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">
          {year && <span className="mr-1">{year}</span>}
          {subtitle}
        </p>
      </div>

      <ArrowUpRight
        size={14}
        className="text-zinc-700 group-hover/item:text-zinc-400 transition-colors flex-shrink-0"
      />
    </Link>
  );
}

const SKELETON_ITEMS = 4;

function SkeletonItem({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-4 py-2.5"
    >
      <div className="w-10 h-14 rounded-sm bg-zinc-800 flex-shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 animate-pulse bg-zinc-700" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-3/4 overflow-hidden relative">
          <div className="absolute inset-0 animate-pulse bg-zinc-700" />
        </div>
        <div className="h-2.5 bg-zinc-800 rounded w-1/2 overflow-hidden relative">
          <div className="absolute inset-0 animate-pulse bg-zinc-700" />
        </div>
      </div>
    </motion.div>
  );
}

export default function TypeaheadResults({
  results,
  query,
  isLoading = false,
  isOpen,
  onSelect,
  onViewAll,
  className,
}: TypeaheadResultsProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'absolute left-0 right-0 top-full mt-1 z-50',
            'bg-[#141414] border border-zinc-800 rounded-sm shadow-2xl shadow-black/70',
            'overflow-hidden',
            className
          )}
        >
          {isLoading ? (
            <div className="py-1">
              {Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
                <SkeletonItem key={i} delay={i * 0.05} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center space-y-2">
              <TrendingUp size={20} className="text-zinc-700 mx-auto" />
              <p className="text-zinc-500 text-sm">
                {query.length >= 2
                  ? `No results for "${truncateText(query, 30)}"`
                  : 'Start typing to search…'}
              </p>
            </div>
          ) : (
            <>
              {/* Result count header */}
              {query.length >= 2 && (
                <div className="px-4 py-2 border-b border-zinc-800/60">
                  <p className="text-zinc-600 text-xs">
                    {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{truncateText(query, 30)}&rdquo;
                  </p>
                </div>
              )}

              {/* Results */}
              <div className="py-1 max-h-[420px] overflow-y-auto scrollbar-hide">
                {results.map((result, i) => (
                  <motion.div
                    key={`${result.media_type}-${result.id}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <ResultItem
                      result={result}
                      query={query}
                      onSelect={onSelect}
                    />
                  </motion.div>
                ))}
              </div>

              {/* View All */}
              {onViewAll && results.length > 0 && (
                <div className="border-t border-zinc-800/60 px-4 py-2.5">
                  <button
                    onClick={() => onViewAll(query)}
                    className="w-full text-center text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    See all results for &ldquo;{truncateText(query, 30)}&rdquo; →
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
