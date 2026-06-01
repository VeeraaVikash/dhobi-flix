'use client';

import { motion } from 'framer-motion';
import { Wifi, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EdgeNode } from '@/data/mockEdges';

interface EdgeBadgeProps {
  edge: EdgeNode;
  /** Compact: icon + latency only */
  compact?: boolean;
  className?: string;
}

function getLatencyColor(ms: number): string {
  if (ms <= 30) return 'text-green-400';
  if (ms <= 80) return 'text-yellow-400';
  if (ms <= 150) return 'text-orange-400';
  return 'text-red-400';
}

function getLatencyDotColor(ms: number): string {
  if (ms <= 30) return 'bg-green-400';
  if (ms <= 80) return 'bg-yellow-400';
  if (ms <= 150) return 'bg-orange-400';
  return 'bg-red-400';
}

function getLatencyLabel(ms: number): string {
  if (ms <= 30) return 'Excellent';
  if (ms <= 80) return 'Good';
  if (ms <= 150) return 'Fair';
  return 'Poor';
}

export default function EdgeBadge({ edge, compact = false, className }: EdgeBadgeProps) {
  const latencyColor = getLatencyColor(edge.latencyMs);
  const dotColor = getLatencyDotColor(edge.latencyMs);
  const latencyLabel = getLatencyLabel(edge.latencyMs);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm',
          'bg-black/60 backdrop-blur-sm border border-zinc-800/80 text-xs',
          className
        )}
        title={`${edge.label} — ${edge.latencyMs}ms`}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
        <span className={cn('font-mono font-semibold', latencyColor)}>
          {edge.latencyMs}ms
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-sm',
        'bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm',
        className
      )}
    >
      {/* Icon + Status */}
      <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center relative">
        <Wifi size={15} className={latencyColor} />
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-zinc-900',
            edge.healthy ? 'bg-green-400' : 'bg-red-500'
          )}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-white text-xs font-semibold leading-snug truncate">{edge.label}</p>
        <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
          <MapPin size={9} />
          <span className="truncate">
            {edge.city}, {edge.country} · {edge.region}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Zap size={9} className={latencyColor} />
            <span className={cn('text-xs font-mono font-bold', latencyColor)}>
              {edge.latencyMs}ms
            </span>
          </div>
          <span className={cn('text-[10px] font-medium', latencyColor)}>{latencyLabel}</span>
          <span className="text-zinc-600 text-[10px]">·</span>
          <span className="text-zinc-500 text-[10px]">{edge.bandwidthGbps} Gbps</span>
        </div>
      </div>
    </motion.div>
  );
}
