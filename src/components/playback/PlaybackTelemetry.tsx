'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronUp, ChevronDown, Wifi, Shield, Clock } from 'lucide-react';
import { cn, formatBitrate, formatDuration } from '@/lib/utils';
import { BufferHealth } from '@/components/playback/BufferBar';
import type { PlaybackSession, ABRMetrics } from '@/types/playback';

interface PlaybackTelemetryProps {
  session: PlaybackSession;
  metrics: ABRMetrics;
  bufferedSeconds: number;
  className?: string;
}

function MetricRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1 border-b border-zinc-800/60 last:border-0">
      <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider flex-shrink-0">
        {label}
      </span>
      <span
        className={cn(
          'text-[11px] font-mono text-right truncate',
          accent ? 'text-[#e50914] font-bold' : 'text-zinc-300'
        )}
      >
        {value}
      </span>
    </div>
  );
}

const SWITCH_REASON_LABELS: Record<string, string> = {
  bandwidth_up: '↑ BW Up',
  bandwidth_down: '↓ BW Down',
  buffer_low: '⚠ Buffer Low',
  initial: 'Initial',
};

export default function PlaybackTelemetry({
  session,
  metrics,
  bufferedSeconds,
  className,
}: PlaybackTelemetryProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  const { manifest, state, currentTime, duration, playbackRate, volume, isMuted } = session;
  const activeRendition = manifest.renditions.find((r) => r.id === metrics.currentRenditionId);
  const droppedFramePct = (metrics.droppedFrameRate * 100).toFixed(1);
  const bufferPct = (
    ((bufferedSeconds + currentTime) / Math.max(1, duration)) *
    100
  ).toFixed(0);

  const isVisible = open || pinned;

  return (
    <div className={cn('absolute top-4 right-4 z-50', className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono transition-all',
          'bg-black/70 border backdrop-blur-sm',
          isVisible
            ? 'border-[#e50914]/40 text-[#e50914]'
            : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
        )}
        aria-label="Toggle playback telemetry"
        aria-expanded={isVisible}
      >
        <Activity size={12} />
        STATS
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 right-0 w-64 bg-black/90 border border-zinc-800 rounded-sm backdrop-blur-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
              <div className="flex items-center gap-1.5 text-[#e50914]">
                <Activity size={11} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Playback Stats</span>
              </div>
              <button
                onClick={() => setPinned((v) => !v)}
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded-sm transition-colors',
                  pinned
                    ? 'bg-[#e50914]/20 text-[#e50914]'
                    : 'text-zinc-600 hover:text-zinc-400'
                )}
              >
                {pinned ? 'PINNED' : 'PIN'}
              </button>
            </div>

            {/* Metrics */}
            <div className="px-3 py-2 space-y-0.5">
              {/* Playback */}
              <div className="mb-2">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Clock size={8} />
                  Playback
                </p>
                <MetricRow label="State" value={state} accent />
                <MetricRow label="Time" value={`${formatDuration(currentTime)} / ${formatDuration(duration)}`} />
                <MetricRow label="Rate" value={`${playbackRate}×`} />
                <MetricRow label="Volume" value={isMuted ? 'Muted' : `${Math.round(volume * 100)}%`} />
              </div>

              {/* ABR */}
              <div className="mb-2">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Wifi size={8} />
                  ABR / Network
                </p>
                <MetricRow
                  label="Rendition"
                  value={activeRendition ? (activeRendition.label || `${activeRendition.height}p`) : metrics.currentRenditionId}
                  accent
                />
                <MetricRow
                  label="Bitrate"
                  value={activeRendition ? formatBitrate(activeRendition.bitrate) : '—'}
                />
                <MetricRow
                  label="Est. BW"
                  value={formatBitrate(metrics.estimatedBandwidth)}
                />
                <MetricRow
                  label="Resolution"
                  value={activeRendition ? `${activeRendition.width}×${activeRendition.height}` : '—'}
                />
                <MetricRow
                  label="FPS"
                  value={activeRendition ? `${activeRendition.frameRate}` : '—'}
                />
                <MetricRow
                  label="Codec"
                  value={activeRendition?.codec.toUpperCase() ?? '—'}
                />
                {metrics.switchReason && (
                  <MetricRow
                    label="Last Switch"
                    value={SWITCH_REASON_LABELS[metrics.switchReason] ?? metrics.switchReason}
                    accent
                  />
                )}
              </div>

              {/* Buffer */}
              <div className="mb-2">
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">
                  Buffer
                </p>
                <MetricRow
                  label="Ahead"
                  value={<BufferHealth bufferSeconds={metrics.bufferHealth} />}
                />
                <MetricRow label="% Loaded" value={`${bufferPct}%`} />
                <MetricRow
                  label="Dropped"
                  value={
                    <span className={metrics.droppedFrameRate > 0.01 ? 'text-red-400' : 'text-green-400'}>
                      {droppedFramePct}%
                    </span>
                  }
                />
              </div>

              {/* DRM / CDN */}
              <div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Shield size={8} />
                  DRM / CDN
                </p>
                <MetricRow label="DRM" value={manifest.drmScheme.toUpperCase()} />
                <MetricRow label="Edge" value={manifest.cdnEdgeId} accent />
                <MetricRow label="Session" value={session.id.slice(0, 12) + '…'} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
