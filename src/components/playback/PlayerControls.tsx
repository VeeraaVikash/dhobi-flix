'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Volume1,
  Maximize, Minimize,
  Subtitles, RotateCcw, Settings,
  FastForward,
} from 'lucide-react';
import BufferBar from '@/components/playback/BufferBar';
import QualitySelector from '@/components/playback/QualitySelector';
import { cn, formatDuration, clampNumber } from '@/lib/utils';
import type { PlaybackSession } from '@/types/playback';
import type { Rendition, SubtitleTrack, AudioTrack, PlaybackRate } from '@/types/playback';

interface PlayerControlsProps {
  session: PlaybackSession;
  bufferedSeconds: number;
  isFullscreen: boolean;
  renditions: Rendition[];
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onQualityChange: (renditionId: string) => void;
  onSubtitleChange: (trackId: string | null) => void;
  onRateChange: (rate: PlaybackRate) => void;
  /** Whether controls are visible */
  visible: boolean;
  className?: string;
}

const PLAYBACK_RATES: PlaybackRate[] = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX size={18} />;
  if (volume < 0.5) return <Volume1 size={18} />;
  return <Volume2 size={18} />;
}

export default function PlayerControls({
  session,
  bufferedSeconds,
  isFullscreen,
  renditions,
  subtitles,
  audioTracks,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  onQualityChange,
  onSubtitleChange,
  onRateChange,
  visible,
  className,
}: PlayerControlsProps) {
  const [volumeHovered, setVolumeHovered] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [subtitleOpen, setSubtitleOpen] = useState(false);

  const { state, currentTime, duration, volume, isMuted, playbackRate, selectedRenditionId } = session;
  const isPlaying = state === 'playing';

  const handleSkip = useCallback(
    (delta: number) => {
      onSeek(clampNumber(currentTime + delta, 0, duration));
    },
    [currentTime, duration, onSeek]
  );

  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onVolumeChange(ratio);
    },
    [onVolumeChange]
  );

  const remaining = duration - currentTime;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16',
            'bg-gradient-to-t from-black/90 via-black/40 to-transparent',
            className
          )}
        >
          {/* Progress / Buffer Bar */}
          <div className="mb-3">
            <BufferBar
              currentTime={currentTime}
              duration={duration}
              buffered={bufferedSeconds}
              onSeek={onSeek}
            />
            {/* Time labels */}
            <div className="flex justify-between text-xs text-zinc-400 mt-1 font-mono select-none">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play / Pause */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-10 h-10 flex items-center justify-center text-white hover:text-zinc-200 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Skip Back 10s */}
            <button
              onClick={() => handleSkip(-10)}
              className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              aria-label="Rewind 10 seconds"
            >
              <SkipBack size={18} />
            </button>

            {/* Skip Forward 30s */}
            <button
              onClick={() => handleSkip(30)}
              className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              aria-label="Forward 30 seconds"
            >
              <SkipForward size={18} />
            </button>

            {/* Volume */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setVolumeHovered(true)}
              onMouseLeave={() => setVolumeHovered(false)}
            >
              <button
                onClick={onMuteToggle}
                className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                <VolumeIcon volume={volume} muted={isMuted} />
              </button>

              {/* Volume Slider */}
              <AnimatePresence>
                {volumeHovered && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 72, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1 accent-[#e50914] cursor-pointer"
                      aria-label="Volume"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Time Remaining */}
            <span className="text-zinc-400 text-xs font-mono select-none hidden sm:block ml-1">
              -{formatDuration(remaining)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback Rate */}
            <div className="relative">
              <button
                onClick={() => { setRateOpen((v) => !v); setSubtitleOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-zinc-300 hover:text-white bg-black/40 rounded-sm border border-zinc-800 hover:border-zinc-600 transition-all"
                aria-label="Playback speed"
              >
                <FastForward size={12} />
                {playbackRate}×
              </button>
              <AnimatePresence>
                {rateOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-2 right-0 w-24 bg-[#1a1a1a] border border-zinc-800 rounded-sm shadow-xl overflow-hidden z-50"
                  >
                    {PLAYBACK_RATES.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => { onRateChange(rate); setRateOpen(false); }}
                        className={cn(
                          'w-full px-3 py-2 text-xs font-mono text-left hover:bg-zinc-800 transition-colors',
                          rate === playbackRate ? 'text-[#e50914] font-bold' : 'text-zinc-400'
                        )}
                      >
                        {rate}×
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => { setSubtitleOpen((v) => !v); setRateOpen(false); }}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-sm border transition-colors',
                    session.selectedSubtitleTrackId
                      ? 'text-[#e50914] border-[#e50914]/40 bg-[#e50914]/10'
                      : 'text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-600'
                  )}
                  aria-label="Subtitles"
                >
                  <Subtitles size={16} />
                </button>
                <AnimatePresence>
                  {subtitleOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2 right-0 w-44 bg-[#1a1a1a] border border-zinc-800 rounded-sm shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-3 py-1.5 border-b border-zinc-800">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Subtitles</p>
                      </div>
                      <button
                        onClick={() => { onSubtitleChange(null); setSubtitleOpen(false); }}
                        className={cn(
                          'w-full px-3 py-2 text-xs text-left hover:bg-zinc-800 transition-colors flex items-center justify-between',
                          !session.selectedSubtitleTrackId ? 'text-white font-semibold' : 'text-zinc-400'
                        )}
                      >
                        Off
                        {!session.selectedSubtitleTrackId && (
                          <span className="w-1.5 h-1.5 bg-[#e50914] rounded-full" />
                        )}
                      </button>
                      {subtitles.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { onSubtitleChange(s.id); setSubtitleOpen(false); }}
                          className={cn(
                            'w-full px-3 py-2 text-xs text-left hover:bg-zinc-800 transition-colors flex items-center justify-between',
                            session.selectedSubtitleTrackId === s.id ? 'text-white font-semibold' : 'text-zinc-400'
                          )}
                        >
                          {s.label}
                          {session.selectedSubtitleTrackId === s.id && (
                            <span className="w-1.5 h-1.5 bg-[#e50914] rounded-full" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Quality Selector */}
            {renditions.length > 0 && (
              <QualitySelector
                renditions={renditions}
                selectedId={selectedRenditionId}
                onSelect={onQualityChange}
                showAuto
              />
            )}

            {/* Fullscreen */}
            <button
              onClick={onFullscreenToggle}
              className="w-9 h-9 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
