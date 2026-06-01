'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info } from 'lucide-react';
import MovieActions from '@/components/movie/MovieActions';
import MovieMeta from '@/components/movie/MovieMeta';
import { getBackdropUrl } from '@/lib/image';
import { truncateText, cn } from '@/lib/utils';
import type { Movie, TVShow } from '@/types/movie';

interface HeroProps {
  media: Movie | TVShow;
  /** Additional items to auto-cycle (billboard carousel) */
  items?: (Movie | TVShow)[];
  /** Cycle interval in ms — only used when `items` is provided */
  cycleMs?: number;
  className?: string;
}

function getTitle(m: Movie | TVShow) {
  return m.media_type === 'movie' ? m.title : m.name;
}

function getTagline(m: Movie | TVShow) {
  return 'tagline' in m ? m.tagline : undefined;
}

const TEXT_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Hero({ media: initial, items, cycleMs = 7000, className }: HeroProps) {
  const allItems = items && items.length > 0 ? [initial, ...items] : [initial];
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const current = allItems[index] ?? initial;

  useEffect(() => {
    if (allItems.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % allItems.length);
    }, cycleMs);
    return () => clearInterval(id);
  }, [allItems.length, cycleMs]);

  const title = getTitle(current);
  const tagline = getTagline(current);
  const overview = current.overview;
  const backdropUrl = getBackdropUrl(current.backdrop_path, 'original');

  return (
    <section
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height: 'min(85vh, 720px)' }}
      aria-label={`Featured: ${title}`}
    >
      {/* Backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {current.backdrop_path ? (
            <Image
              src={backdropUrl}
              alt={`${title} backdrop`}
              fill
              className="object-cover object-top"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-[#0a0a0a]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 lg:px-12 pb-16 lg:pb-20 max-w-[1800px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            variants={TEXT_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg lg:max-w-2xl space-y-4"
          >
            {/* Type Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[#e50914] text-xs font-bold tracking-widest uppercase">
                {current.media_type === 'movie' ? 'Film' : 'Series'}
              </span>
              {current.adult && (
                <span className="border border-zinc-500 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
                  A
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-none tracking-tighter drop-shadow-lg">
              {title}
            </h1>

            {/* Tagline */}
            {tagline && (
              <p className="text-zinc-300 text-sm md:text-base italic leading-relaxed">
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            {/* Meta */}
            <MovieMeta
              media={current}
              fields={['year', 'runtime', 'rating', 'language']}
              className="text-zinc-300"
            />

            {/* Overview */}
            {overview && (
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-md">
                {truncateText(overview, 180)}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <MovieActions
                mediaId={current.id}
                mediaType={current.media_type as 'movie' | 'tv'}
                variant="hero"
              />
              <button
                onClick={() => setMuted((v) => !v)}
                className="ml-auto w-10 h-10 rounded-full border border-zinc-600/70 bg-black/30 text-white hover:bg-black/60 flex items-center justify-center transition-all"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Dots */}
        {allItems.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {allItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                className={cn(
                  'transition-all duration-300 rounded-full',
                  i === index
                    ? 'w-6 h-1.5 bg-[#e50914]'
                    : 'w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400'
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Maturity / Rating badge — top right */}
      <div className="absolute top-20 lg:top-24 right-4 sm:right-8 lg:right-12 z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="border border-zinc-600 bg-black/40 backdrop-blur-sm text-zinc-300 text-xs font-medium px-2.5 py-1.5 rounded-sm"
        >
          {current.vote_average > 0 && (
            <span className="text-amber-400 font-bold">{current.vote_average.toFixed(1)}</span>
          )}
          {current.adult && (
            <span className="ml-1 border border-zinc-500 text-zinc-400 text-[10px] px-1 rounded-sm">A</span>
          )}
        </motion.div>
      </div>
    </section>
  );
}
