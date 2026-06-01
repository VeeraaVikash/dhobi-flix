'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Check, Wifi } from 'lucide-react';
import { cn, formatBitrate } from '@/lib/utils';
import type { Rendition } from '@/types/playback';

interface QualitySelectorProps {
  renditions: Rendition[];
  selectedId: string;
  onSelect: (renditionId: string) => void;
  /** Show "Auto" option at top */
  showAuto?: boolean;
  /** Currently auto-selected rendition id (for the Auto label) */
  autoRenditionId?: string;
  className?: string;
}

function getRenditionLabel(r: Rendition): string {
  // Use label if available, otherwise derive from height
  if (r.label) return r.label;
  const suffix = r.frameRate >= 60 ? '60' : '';
  if (r.height >= 2160) return `4K${suffix ? ' ' + suffix + 'fps' : ''}`;
  return `${r.height}p${suffix}`;
}

function getCodecBadge(codec: Rendition['codec']): string {
  const map: Record<Rendition['codec'], string> = {
    h264: 'AVC',
    h265: 'HEVC',
    av1: 'AV1',
    vp9: 'VP9',
  };
  return map[codec];
}

function getResolutionGroup(r: Rendition): string {
  if (r.height >= 2160) return 'Ultra HD';
  if (r.height >= 1080) return 'HD';
  if (r.height >= 720) return 'HD';
  return 'SD';
}

export default function QualitySelector({
  renditions,
  selectedId,
  onSelect,
  showAuto = true,
  autoRenditionId,
  className,
}: QualitySelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sorted = [...renditions].sort((a, b) => b.bitrate - a.bitrate);
  const selected = sorted.find((r) => r.id === selectedId) ?? sorted[0];
  const isAuto = selectedId === 'auto';

  const selectedLabel = isAuto
    ? `Auto${autoRenditionId ? ` (${getRenditionLabel(sorted.find((r) => r.id === autoRenditionId) ?? sorted[0])})` : ''}`
    : selected
    ? getRenditionLabel(selected)
    : '—';

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/50 hover:bg-black/70 border border-zinc-700 rounded-sm text-white text-xs font-mono font-semibold transition-all"
        aria-label="Select video quality"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Wifi size={11} className="text-zinc-400" />
        <span>{selectedLabel}</span>
        <ChevronUp
          size={12}
          className={cn('text-zinc-400 transition-transform duration-200', !open && 'rotate-180')}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Video quality options"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-2 right-0 w-56 bg-[#1a1a1a] border border-zinc-800 rounded-sm shadow-2xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-zinc-800">
              <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                Video Quality
              </p>
            </div>

            <div className="py-1 max-h-64 overflow-y-auto scrollbar-hide">
              {showAuto && (
                <button
                  role="option"
                  aria-selected={isAuto}
                  onClick={() => { onSelect('auto'); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-zinc-800 transition-colors',
                    isAuto ? 'text-white' : 'text-zinc-400'
                  )}
                >
                  <div>
                    <p className="font-semibold text-left">Auto</p>
                    <p className="text-[10px] text-zinc-600 text-left">Adaptive quality</p>
                  </div>
                  {isAuto && <Check size={14} className="text-[#e50914] flex-shrink-0" />}
                </button>
              )}

              {sorted.map((r) => {
                const isSelected = !isAuto && r.id === selectedId;
                const label = getRenditionLabel(r);
                const group = getResolutionGroup(r);
                const codec = getCodecBadge(r.codec);

                return (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onSelect(r.id); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800 transition-colors',
                      isSelected ? 'text-white' : 'text-zinc-400'
                    )}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{label}</span>
                        <span className="text-[9px] px-1 py-0.5 bg-zinc-700 text-zinc-400 rounded-sm font-mono">
                          {codec}
                        </span>
                        {group === 'Ultra HD' && (
                          <span className="text-[9px] px-1 py-0.5 bg-[#e50914]/20 text-[#e50914] rounded-sm font-bold">
                            4K
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {formatBitrate(r.bitrate)} · {r.frameRate}fps · {r.width}×{r.height}
                      </p>
                    </div>
                    {isSelected && <Check size={14} className="text-[#e50914] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
