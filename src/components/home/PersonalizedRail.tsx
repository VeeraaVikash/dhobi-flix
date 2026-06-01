'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MovieRow from '@/components/movie/MovieRow';
import { cn } from '@/lib/utils';
import type { Movie, TVShow } from '@/types/movie';

interface PersonalizedRailProps {
  /** e.g. "Because you watched Breaking Bad" or "Top Picks for You" */
  title: string;
  /** Optional sub-label shown as a badge */
  affinityLabel?: string;
  media: (Movie | TVShow)[];
  seeAllHref?: string;
  onAction?: (action: 'play' | 'add' | 'like' | 'info', item: Movie | TVShow) => void;
  className?: string;
  /** Show personalization badge */
  showBadge?: boolean;
}

export default function PersonalizedRail({
  title,
  affinityLabel,
  media,
  seeAllHref,
  onAction,
  className,
  showBadge = true,
}: PersonalizedRailProps) {
  if (media.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('space-y-1', className)}
    >
      {/* Title row with badge */}
      <div className="flex items-center gap-2 mb-1">
        {showBadge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-[#e50914] uppercase">
            <Sparkles size={10} />
            For You
          </span>
        )}
        {affinityLabel && (
          <span className="text-zinc-600 text-xs">·</span>
        )}
        {affinityLabel && (
          <span className="text-zinc-500 text-xs truncate max-w-[240px]">{affinityLabel}</span>
        )}
      </div>

      <MovieRow
        title={title}
        media={media}
        seeAllHref={seeAllHref}
        onAction={onAction}
      />
    </motion.div>
  );
}
