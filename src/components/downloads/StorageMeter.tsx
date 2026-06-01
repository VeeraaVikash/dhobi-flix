'use client';

import { motion } from 'framer-motion';
import { HardDrive, Film, Tv, AlertTriangle } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import type { DownloadStorageSummary } from '@/types/download';

interface StorageMeterProps {
  summary: DownloadStorageSummary;
  className?: string;
  /** Compact single-row variant */
  compact?: boolean;
}

const RING_SIZE = 120;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function RingChart({ usedPct }: { usedPct: number }) {
  const clampedPct = Math.min(100, Math.max(0, usedPct));
  const offset = CIRCUMFERENCE * (1 - clampedPct / 100);

  const ringColor =
    clampedPct >= 90 ? '#ef4444' : clampedPct >= 75 ? '#f59e0b' : '#e50914';

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="-rotate-90"
    >
      {/* Track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="#27272a"
        strokeWidth={STROKE_WIDTH}
      />
      {/* Progress */}
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={ringColor}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
    </svg>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  color = 'text-zinc-400',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-zinc-800/60 last:border-0">
      <div className="flex items-center gap-2">
        <Icon size={13} className={color} />
        <span className="text-zinc-500 text-xs">{label}</span>
      </div>
      <span className="text-zinc-300 text-xs font-mono font-semibold">{value}</span>
    </div>
  );
}

export default function StorageMeter({ summary, className, compact = false }: StorageMeterProps) {
  const {
    totalStorageBytes,
    usedStorageBytes,
    availableStorageBytes,
    totalDownloads,
    completedDownloads,
    activeDownloads,
  } = summary;

  const usedPct =
    totalStorageBytes > 0 ? (usedStorageBytes / totalStorageBytes) * 100 : 0;

  const isLow = availableStorageBytes < 500_000_000; // < 500 MB
  const isWarning = usedPct >= 75;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-sm', className)}>
        <HardDrive size={16} className="text-zinc-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400">Storage</span>
            <span className="text-zinc-300 font-mono font-semibold">
              {formatBytes(usedStorageBytes)} / {formatBytes(totalStorageBytes)}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                usedPct >= 90 ? 'bg-red-500' : usedPct >= 75 ? 'bg-yellow-500' : 'bg-[#e50914]'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${usedPct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        {isWarning && (
          <AlertTriangle size={14} className={isLow ? 'text-red-400' : 'text-yellow-400'} />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-5 bg-zinc-900/60 border border-zinc-800 rounded-sm space-y-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <HardDrive size={16} className="text-[#e50914]" />
        <h3 className="text-white text-sm font-bold">Device Storage</h3>
      </div>

      {/* Ring + Labels */}
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <RingChart usedPct={usedPct} />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={cn(
                'text-lg font-black font-mono leading-none',
                usedPct >= 90 ? 'text-red-400' : usedPct >= 75 ? 'text-yellow-400' : 'text-white'
              )}
            >
              {usedPct.toFixed(0)}%
            </span>
            <span className="text-zinc-600 text-[9px] uppercase tracking-wider mt-0.5">Used</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-0">
          <StatRow
            icon={HardDrive}
            label="Total"
            value={formatBytes(totalStorageBytes)}
          />
          <StatRow
            icon={HardDrive}
            label="Used"
            value={formatBytes(usedStorageBytes)}
            color={usedPct >= 90 ? 'text-red-400' : 'text-zinc-400'}
          />
          <StatRow
            icon={HardDrive}
            label="Free"
            value={formatBytes(availableStorageBytes)}
            color={isLow ? 'text-red-400' : 'text-zinc-400'}
          />
        </div>
      </div>

      {/* Download counts */}
      <div className="pt-3 border-t border-zinc-800 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-white text-xl font-black">{totalDownloads}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Total</p>
        </div>
        <div className="text-center border-x border-zinc-800">
          <p className="text-green-400 text-xl font-black">{completedDownloads}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Ready</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400 text-xl font-black">{activeDownloads}</p>
          <p className="text-zinc-600 text-[10px] uppercase tracking-wider mt-0.5">Active</p>
        </div>
      </div>

      {/* Low storage warning */}
      {isLow && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm"
        >
          <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs leading-relaxed">
            Low storage. Only {formatBytes(availableStorageBytes)} remaining. New downloads may fail.
          </p>
        </motion.div>
      )}
    </div>
  );
}
