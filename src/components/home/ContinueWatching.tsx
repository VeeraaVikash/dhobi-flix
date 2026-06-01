'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Clock } from 'lucide-react';
import { getPosterUrl } from '@/lib/image';
import { formatProgressPercent, formatDuration, cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import SafeImage from '@/components/movie/SafeImage';
import type { WatchHistoryEntry } from '@/types/profile';
import type { Movie, TVShow } from '@/types/movie';

interface ContinueWatchingItemProps {
  entry: WatchHistoryEntry;
  media: Movie | TVShow;
  onRemove?: (mediaId: number) => void;
}

function getTitle(m: Movie | TVShow) {
  return m.media_type === 'movie' ? m.title : m.name;
}

function getEpisodeLabel(entry: WatchHistoryEntry) {
  if (entry.mediaType !== 'tv') return null;
  if (entry.seasonNumber && entry.episodeNumber) {
    return `S${entry.seasonNumber} E${entry.episodeNumber}`;
  }
  return null;
}

function getWatchHref(entry: WatchHistoryEntry) {
  if (entry.mediaType === 'movie') {
    return ROUTES.WATCH_MOVIE(entry.mediaId);
  }
  const s = entry.seasonNumber ?? 1;
  const e = entry.episodeNumber ?? 1;
  return ROUTES.WATCH_TV(entry.mediaId, s, e);
}

function ContinueWatchingItem({ entry, media, onRemove }: ContinueWatchingItemProps) {
  const [hovered, setHovered] = useState(false);
  const [removed, setRemoved] = useState(false);

  const title = getTitle(media);
  const episodeLabel = getEpisodeLabel(entry);
  const progressPct = formatProgressPercent(entry.progressSeconds, entry.durationSeconds);
  const remaining = entry.durationSeconds - entry.progressSeconds;
  const watchHref = getWatchHref(entry);
  const posterUrl = getPosterUrl(media.poster_path, 'w342');

  const handleRemove = () => {
    setRemoved(true);
    onRemove?.(entry.mediaId);
  };

  if (removed) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex-shrink-0 w-[220px] sm:w-[260px] lg:w-[300px] group"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="relative rounded-sm overflow-hidden bg-zinc-900 aspect-video">
        {/* Backdrop / Poster */}
        <SafeImage
          src={media.poster_path ? posterUrl : null}
          alt={title}
          fill
          className="object-cover object-center scale-105"
          fallbackLabel={title}
          sizes="(max-width: 640px) 220px, (max-width: 1024px) 260px, 300px"
        />

        {/* Dark overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity duration-200',
            hovered ? 'opacity-60' : 'opacity-0'
          )}
        />

        {/* Play Button */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Link
                href={watchHref}
                className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-xl"
                aria-label={`Continue ${title}`}
              >
                <Play size={22} fill="#0a0a0a" className="text-black ml-1" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className={cn(
            'absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-zinc-300 hover:text-white hover:bg-black transition-all duration-200',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
          aria-label="Remove from Continue Watching"
        >
          <X size={14} />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/80">
          <div
            className="h-full bg-[#e50914] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card Meta */}
      <div className="mt-2 space-y-0.5 px-0.5">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-1">{title}</p>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {episodeLabel && <span className="text-zinc-400">{episodeLabel}</span>}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDuration(remaining)} left
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ContinueWatchingProps {
  entries: WatchHistoryEntry[];
  /** Map of mediaId → Movie | TVShow */
  mediaMap: Map<number, Movie | TVShow>;
  onRemove?: (mediaId: number) => void;
  className?: string;
}

export default function ContinueWatching({
  entries,
  mediaMap,
  onRemove,
  className,
}: ContinueWatchingProps) {
  // Filter to only incomplete and valid entries
  const validEntries = entries.filter(
    (e) => !e.completed && e.progressSeconds > 0 && mediaMap.has(e.mediaId)
  );

  if (validEntries.length === 0) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <h2 className="text-white text-base md:text-lg font-bold tracking-tight">
        Continue Watching
      </h2>
      <div
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence>
          {validEntries.map((entry) => {
            const media = mediaMap.get(entry.mediaId);
            if (!media) return null;
            return (
              <ContinueWatchingItem
                key={`${entry.mediaId}-${entry.mediaType}`}
                entry={entry}
                media={media}
                onRemove={onRemove}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
