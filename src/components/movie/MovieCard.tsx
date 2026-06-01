'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Check, ThumbsUp, ChevronDown, Star } from 'lucide-react';
import { getPosterUrl } from '@/lib/image';
import { formatYear, truncateText, cn } from '@/lib/utils';
import { getGenreNames } from '@/constants/genres';
import { ROUTES } from '@/constants/routes';
import SafeImage from '@/components/movie/SafeImage';
import type { Movie, TVShow } from '@/types/movie';

interface MovieCardProps {
  media: Movie | TVShow;
  /** 0–100, renders a progress bar at the bottom */
  progressPercent?: number;
  /** Card width class, defaults to auto */
  className?: string;
  /** Called when user clicks any action button */
  onAction?: (action: 'play' | 'add' | 'like' | 'info', media: Movie | TVShow) => void;
  /** Show compact card without hover overlay */
  compact?: boolean;
  /** Is this item currently in the user's list? */
  inList?: boolean;
}

function getTitle(media: Movie | TVShow): string {
  return media.media_type === 'movie' ? media.title : media.name;
}

function getYear(media: Movie | TVShow): string {
  if (media.media_type === 'movie') {
    return media.release_date ? formatYear(media.release_date) : '';
  }
  return media.first_air_date ? formatYear(media.first_air_date) : '';
}

function getDetailHref(media: Movie | TVShow): string {
  return media.media_type === 'movie'
    ? ROUTES.MOVIE(media.id)
    : ROUTES.TV(media.id);
}

function getWatchHref(media: Movie | TVShow): string {
  return media.media_type === 'movie'
    ? ROUTES.WATCH_MOVIE(media.id)
    : ROUTES.WATCH_TV(media.id, 1, 1);
}

export default function MovieCard({
  media,
  progressPercent,
  className,
  onAction,
  compact = false,
  inList = false,
}: MovieCardProps) {
  const [hovered, setHovered] = useState(false);

  const title = getTitle(media);
  const year = getYear(media);
  const href = getDetailHref(media);
  const watchHref = getWatchHref(media);
  const genres = (!media.genre_ids || media.genre_ids.length === 0) 
    ? [] 
    : getGenreNames(media.genre_ids, media.media_type as 'movie' | 'tv').slice(0, 2);
  const rating = media.vote_average.toFixed(1);
  const posterUrl = getPosterUrl(media.poster_path, 'w342');

  return (
    <motion.div
      className={cn('relative rounded-sm overflow-visible flex-shrink-0', className)}
      onHoverStart={() => !compact && setHovered(true)}
      onHoverEnd={() => !compact && setHovered(false)}
      animate={hovered ? { scale: 1.06, zIndex: 20 } : { scale: 1, zIndex: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Poster */}
      <Link href={href} className="block aspect-[2/3] rounded-sm overflow-hidden bg-zinc-900">
        <SafeImage
          src={media.poster_path ? posterUrl : null}
          alt={title}
          width={342}
          height={513}
          className="w-full h-full object-cover transition-all duration-300"
          fallbackLabel={title}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
        />

        {/* Progress Bar */}
        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/60">
            <div
              className="h-full bg-[#e50914] transition-all"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        )}
      </Link>

      {/* Hover Overlay Card */}
      <AnimatePresence>
        {hovered && !compact && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-zinc-800 rounded-b-md shadow-2xl shadow-black/60 z-30 p-3 min-w-[180px]"
          >
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                href={watchHref}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('play', media);
                }}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors flex-shrink-0"
                aria-label={`Play ${title}`}
              >
                <Play size={14} className="text-black ml-0.5" fill="currentColor" />
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('add', media);
                }}
                className="w-9 h-9 border-2 border-zinc-500 rounded-full flex items-center justify-center hover:border-white transition-colors flex-shrink-0"
                aria-label={inList ? "Remove from My List" : "Add to My List"}
              >
                {inList ? <Check size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
              </button>
              <button
                onClick={() => onAction?.('like', media)}
                className="w-9 h-9 border-2 border-zinc-500 rounded-full flex items-center justify-center hover:border-white transition-colors flex-shrink-0"
                aria-label="Like"
              >
                <ThumbsUp size={14} className="text-white" />
              </button>
              <div className="flex-1" />
              <Link
                href={href}
                onClick={() => onAction?.('info', media)}
                className="w-9 h-9 border-2 border-zinc-500 rounded-full flex items-center justify-center hover:border-white transition-colors flex-shrink-0"
                aria-label="More info"
              >
                <ChevronDown size={16} className="text-white" />
              </Link>
            </div>

            {/* Meta */}
            <div className="space-y-1.5">
              <p className="text-white text-sm font-semibold leading-tight line-clamp-1">
                {title}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                  <Star size={10} fill="currentColor" />
                  {rating}
                </span>
                {year && (
                  <span className="text-zinc-400 text-xs">{year}</span>
                )}
                {media.adult && (
                  <span className="text-xs border border-zinc-600 text-zinc-400 px-1 rounded-sm leading-tight">
                    A
                  </span>
                )}
              </div>
              {genres.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {genres.map((g, i) => (
                    <span key={g} className="text-zinc-400 text-xs">
                      {g}{i < genres.length - 1 && (
                        <span className="inline-block w-1 h-1 bg-zinc-600 rounded-full ml-1 translate-y-[-2px]" />
                      )}
                    </span>
                  ))}
                </div>
              )}
              {media.overview && (
                <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                  {truncateText(media.overview, 90)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
