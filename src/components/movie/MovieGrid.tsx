'use client';

import { motion } from 'framer-motion';
import { Film } from 'lucide-react';
import MovieCard from '@/components/movie/MovieCard';
import { GridSkeleton } from '@/components/home/RowSkeleton';
import { cn } from '@/lib/utils';
import type { Movie, TVShow } from '@/types/movie';

interface MovieGridProps {
  media: (Movie | TVShow)[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
  onAction?: (action: 'play' | 'add' | 'like' | 'info', item: Movie | TVShow) => void;
  /** Map of mediaId → progress percent (0-100) */
  progressMap?: Record<number, number>;
  /** Map of mediaId → boolean */
  inListMap?: Record<number, boolean>;
  emptyMessage?: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
} as const;

export default function MovieGrid({
  media,
  isLoading = false,
  skeletonCount = 18,
  className,
  onAction,
  progressMap,
  inListMap,
  emptyMessage = 'No titles found.',
}: MovieGridProps) {
  if (isLoading) {
    return <GridSkeleton count={skeletonCount} className={className} />;
  }

  if (media.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
          <Film size={24} className="text-zinc-700" />
        </div>
        <p className="text-zinc-500 text-sm">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8',
        'gap-2 md:gap-3',
        className
      )}
    >
      {media.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <MovieCard
            media={item}
            onAction={onAction}
            progressPercent={progressMap?.[item.id]}
            inList={inListMap?.[item.id]}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
