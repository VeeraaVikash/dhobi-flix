'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RowSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number;
  /** Show a title skeleton above the row */
  showTitle?: boolean;
  className?: string;
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex-shrink-0 w-[140px] sm:w-[160px] lg:w-[190px]"
    >
      {/* Poster */}
      <div className="aspect-[2/3] rounded-sm bg-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
    </motion.div>
  );
}

export default function RowSkeleton({
  count = 8,
  showTitle = true,
  className,
}: RowSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showTitle && (
        <div className="h-5 w-40 bg-zinc-800 rounded relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
      )}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.04} />
        ))}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 50%,
            transparent 100%
          );
          animation: shimmer 1.6s infinite;
        }
      `}</style>
    </div>
  );
}

// ─── GridSkeleton variant ─────────────────────────────────────────────────────

interface GridSkeletonProps {
  count?: number;
  className?: string;
}

export function GridSkeleton({ count = 12, className }: GridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03, duration: 0.3 }}
          className="aspect-[2/3] rounded-sm bg-zinc-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 skeleton-shimmer" />
        </motion.div>
      ))}
    </div>
  );
}
