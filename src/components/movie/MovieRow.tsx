'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import MovieCard from '@/components/movie/MovieCard';
import { cn } from '@/lib/utils';
import type { Movie, TVShow } from '@/types/movie';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  media: (Movie | TVShow)[];
  seeAllHref?: string;
  className?: string;
  onAction?: (action: 'play' | 'add' | 'like' | 'info', item: Movie | TVShow) => void;
}

const SCROLL_AMOUNT = 0.75; // fraction of container width per click

export default function MovieRow({
  title,
  subtitle,
  media,
  seeAllHref,
  className,
  onAction,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * SCROLL_AMOUNT;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  }, []);

  if (media.length === 0) return null;

  return (
    <section className={cn('group/row', className)}>
      {/* Header */}
      <div className="flex items-end justify-between mb-3 md:mb-4 px-0">
        <div className="min-w-0">
          <h2 className="text-white text-base md:text-lg font-bold tracking-tight leading-snug truncate">
            {seeAllHref ? (
              <Link
                href={seeAllHref}
                className="inline-flex items-center gap-1 hover:text-zinc-300 transition-colors group/title"
              >
                {title}
                <ChevronRight
                  size={16}
                  className="text-[#e50914] opacity-0 group-hover/title:opacity-100 -translate-x-1 group-hover/title:translate-x-0 transition-all duration-200"
                />
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="text-zinc-500 text-xs mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs text-zinc-400 hover:text-white transition-colors flex-shrink-0 ml-4 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          >
            See all
          </Link>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative -mx-4 sm:-mx-8 lg:-mx-12">
        {/* Left Fade + Arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
              <button
                onClick={() => scroll('left')}
                className="relative ml-1 w-9 h-14 bg-black/60 hover:bg-black/90 border border-zinc-800 rounded-sm flex items-center justify-center text-white transition-all opacity-0 group-hover/row:opacity-100 hover:scale-105"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Fade + Arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
              <button
                onClick={() => scroll('right')}
                className="relative mr-1 w-9 h-14 bg-black/60 hover:bg-black/90 border border-zinc-800 rounded-sm flex items-center justify-center text-white transition-all opacity-0 group-hover/row:opacity-100 hover:scale-105"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 lg:px-12 py-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {media.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
              className="w-[140px] sm:w-[160px] lg:w-[190px] flex-shrink-0"
            >
              <MovieCard media={item} onAction={onAction} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
