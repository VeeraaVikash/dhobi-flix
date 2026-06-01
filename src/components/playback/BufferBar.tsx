'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BufferBarProps {
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Seconds of buffered content from current position */
  buffered: number;
  /** Whether the user can seek */
  interactive?: boolean;
  /** Called when user seeks */
  onSeek?: (seconds: number) => void;
  className?: string;
}

export default function BufferBar({
  currentTime,
  duration,
  buffered,
  interactive = true,
  onSeek,
  className,
}: BufferBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const playedPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, ((currentTime + buffered) / duration) * 100) : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !onSeek || !barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [interactive, onSeek, duration]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onSeek || duration <= 0) return;
      const step = 10;
      if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + step));
      if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - step));
    },
    [onSeek, duration, currentTime]
  );

  return (
    <div
      ref={barRef}
      role={interactive ? 'slider' : undefined}
      aria-label={interactive ? 'Video progress' : undefined}
      aria-valuenow={interactive ? Math.round(currentTime) : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? Math.round(duration) : undefined}
      tabIndex={interactive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative h-1 bg-zinc-700/60 rounded-full overflow-hidden group/bar transition-all duration-150',
        interactive && 'cursor-pointer hover:h-[5px]',
        className
      )}
    >
      {/* Buffered region */}
      <div
        className="absolute inset-y-0 left-0 bg-zinc-500/50 rounded-full transition-all duration-300"
        style={{ width: `${bufferedPct}%` }}
        aria-hidden
      />

      {/* Played region */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-[#e50914] rounded-full"
        animate={{ width: `${playedPct}%` }}
        transition={{ duration: 0.15, ease: 'linear' }}
        aria-hidden
      />

      {/* Scrubber handle */}
      {interactive && (
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{ left: `calc(${playedPct}% - 7px)` }}
          aria-hidden
        />
      )}
    </div>
  );
}

// ─── Mini Buffer Health Indicator ────────────────────────────────────────────

interface BufferHealthProps {
  bufferSeconds: number;
  className?: string;
}

const BUFFER_THRESHOLDS = { good: 15, warn: 5 };

export function BufferHealth({ bufferSeconds, className }: BufferHealthProps) {
  const level = bufferSeconds >= BUFFER_THRESHOLDS.good
    ? 'good'
    : bufferSeconds >= BUFFER_THRESHOLDS.warn
    ? 'warn'
    : 'low';

  const colorMap = { good: 'text-green-400', warn: 'text-yellow-400', low: 'text-red-400' };
  const labelMap = { good: 'Healthy', warn: 'Low', low: 'Critical' };

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <div className="flex gap-0.5 items-end h-3">
        {[1, 2, 3].map((bar) => {
          const filled =
            (bar === 1 && level !== 'low') ||
            (bar <= 2 && level === 'warn') ||
            level === 'good';
          return (
            <div
              key={bar}
              style={{ height: `${bar * 33}%` }}
              className={cn(
                'w-1 rounded-sm transition-colors',
                filled ? colorMap[level] : 'bg-zinc-700'
              )}
            />
          );
        })}
      </div>
      <span className={cn('font-mono', colorMap[level])}>
        {bufferSeconds.toFixed(1)}s
      </span>
      <span className="text-zinc-600">{labelMap[level]}</span>
    </div>
  );
}
