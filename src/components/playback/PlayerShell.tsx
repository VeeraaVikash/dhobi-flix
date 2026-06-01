'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Film } from 'lucide-react';
import PlayerControls from '@/components/playback/PlayerControls';
import PlaybackTelemetry from '@/components/playback/PlaybackTelemetry';
import EdgeBadge from '@/components/playback/EdgeBadge';
import { cn } from '@/lib/utils';
import { getEdgeById } from '@/data/mockEdges';
import type { PlaybackSession, ABRMetrics, PlaybackRate } from '@/types/playback';

interface PlayerShellProps {
  session: PlaybackSession;
  /** Title to show in the top bar */
  title: string;
  /** Back navigation href */
  backHref?: string;
  /** Whether telemetry debug panel is available */
  showTelemetry?: boolean;
  /** Called when session state should change */
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (seconds: number) => void;
  onVolumeChange?: (v: number) => void;
  onMuteToggle?: () => void;
  onQualityChange?: (renditionId: string) => void;
  onSubtitleChange?: (trackId: string | null) => void;
  onRateChange?: (rate: PlaybackRate) => void;
  className?: string;
}

const HIDE_CONTROLS_DELAY = 3500;

const MOCK_ABR_METRICS: ABRMetrics = {
  currentRenditionId: 'r1080p',
  bufferHealth: 20,
  droppedFrameRate: 0.002,
  estimatedBandwidth: 12000,
  switchReason: 'initial',
};

export default function PlayerShell({
  session,
  title,
  backHref = '/',
  showTelemetry = false,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onQualityChange,
  onSubtitleChange,
  onRateChange,
  className,
}: PlayerShellProps) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bufferedSeconds] = useState(20);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { state, manifest } = session;
  const isLoading = state === 'loading' || state === 'buffering';
  const isError = state === 'error';

  const edge = getEdgeById(manifest.cdnEdgeId);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    if (state === 'playing') {
      hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_DELAY);
    }
  }, [state]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [resetHideTimer]);

  const handleMouseMove = useCallback(() => resetHideTimer(), [resetHideTimer]);
  const handleClick = useCallback(() => {
    if (controlsVisible) {
      if (state === 'playing') onPause?.();
      else onPlay?.();
    } else {
      resetHideTimer();
    }
  }, [controlsVisible, state, onPause, onPlay, resetHideTimer]);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black select-none overflow-hidden',
        isFullscreen ? 'h-screen' : 'aspect-video max-h-[100vh]',
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onTouchStart={handleMouseMove}
      style={{ cursor: controlsVisible ? 'default' : 'none' }}
    >
      {/* Video placeholder — replace with <video> element in production */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-2 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto">
            <Film size={32} className="text-zinc-600" />
          </div>
          <p className="text-zinc-600 text-sm font-mono">VIDEO ELEMENT</p>
          <p className="text-zinc-700 text-xs">{manifest.manifestUrl}</p>
        </div>
      </div>

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="text-[#e50914] animate-spin" />
              <p className="text-zinc-400 text-sm">
                {state === 'buffering' ? 'Buffering…' : 'Loading…'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-20"
          >
            <div className="flex flex-col items-center gap-3 text-center px-4">
              <AlertCircle size={36} className="text-red-500" />
              <p className="text-white font-semibold">Playback Error</p>
              <p className="text-zinc-400 text-sm max-w-xs">
                Unable to load this content. Please check your connection and try again.
              </p>
              <button className="mt-2 px-5 py-2 bg-[#e50914] text-white text-sm rounded-sm hover:bg-red-700 transition-colors">
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 px-4 pt-4 pb-16 z-30 bg-gradient-to-b from-black/90 via-black/30 to-transparent pointer-events-none"
          >
            <div className="flex items-center gap-4 pointer-events-auto">
              <Link
                href={backHref}
                className="flex items-center gap-2 text-white hover:text-zinc-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowLeft size={20} />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate leading-none">{title}</p>
                {manifest.mediaType === 'tv' && manifest.episodeId && (
                  <p className="text-zinc-400 text-xs mt-0.5">Episode {manifest.episodeId}</p>
                )}
              </div>

              {/* DRM Badge */}
              {manifest.drmScheme && (
                <div className="hidden sm:block pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-sm text-[10px] font-mono font-semibold uppercase tracking-wider">
                    {manifest.drmScheme}
                  </span>
                </div>
              )}

              {/* Edge Badge */}
              {edge && (
                <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  <EdgeBadge edge={edge} compact />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Controls (bottom) */}
      <div className="absolute inset-0 pointer-events-none z-30 flex items-end" onClick={(e) => e.stopPropagation()}>
        <PlayerControls
          session={session}
          bufferedSeconds={bufferedSeconds}
          isFullscreen={isFullscreen}
          renditions={manifest.renditions}
          subtitles={manifest.subtitleTracks}
          audioTracks={manifest.audioTracks}
          onPlay={onPlay ?? (() => {})}
          onPause={onPause ?? (() => {})}
          onSeek={onSeek ?? (() => {})}
          onVolumeChange={onVolumeChange ?? (() => {})}
          onMuteToggle={onMuteToggle ?? (() => {})}
          onFullscreenToggle={handleFullscreen}
          onQualityChange={onQualityChange ?? (() => {})}
          onSubtitleChange={onSubtitleChange ?? (() => {})}
          onRateChange={onRateChange ?? (() => {})}
          visible={controlsVisible}
          className="pointer-events-auto w-full"
        />
      </div>

      {/* Telemetry Overlay */}
      {showTelemetry && (
        <PlaybackTelemetry
          session={session}
          metrics={MOCK_ABR_METRICS}
          bufferedSeconds={bufferedSeconds}
          className="z-40"
        />
      )}
    </div>
  );
}
