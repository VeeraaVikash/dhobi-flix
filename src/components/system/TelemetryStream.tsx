'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Pause, Play, Trash2 } from 'lucide-react';

interface StreamEvent {
  id: string;
  type: string;
  profileId: string;
  mediaId?: number;
  detail: string;
  timestamp: Date;
  category: 'playback' | 'search' | 'download' | 'navigation' | 'error';
}

const EVENT_TEMPLATES: Omit<StreamEvent, 'id' | 'timestamp'>[] = [
  { type: 'playback_start', profileId: 'p_001', mediaId: 550, detail: 'Fight Club · 1080p · Chennai Edge', category: 'playback' },
  { type: 'search_query', profileId: 'p_002', detail: 'Query: "inception" → 12 results · 38ms', category: 'search' },
  { type: 'playback_quality_change', profileId: 'p_001', mediaId: 550, detail: '1080p → 720p · bandwidth_down', category: 'playback' },
  { type: 'page_view', profileId: 'p_003', detail: '/movie/27205 · load 210ms', category: 'navigation' },
  { type: 'playback_buffering', profileId: 'p_001', mediaId: 550, detail: 'Buffer: 240ms · health: 2.1s', category: 'playback' },
  { type: 'download_start', profileId: 'p_002', mediaId: 603, detail: 'The Matrix · 720p · ~1.4GB', category: 'download' },
  { type: 'search_result_click', profileId: 'p_004', detail: 'Interstellar · pos 2 · query "space"', category: 'search' },
  { type: 'playback_pause', profileId: 'p_003', mediaId: 238, detail: 'The Godfather · 01:24:11', category: 'playback' },
  { type: 'playback_error', profileId: 'p_005', mediaId: 11, detail: 'ERR_MANIFEST_LOAD · retrying…', category: 'error' },
  { type: 'media_add_to_list', profileId: 'p_002', mediaId: 299534, detail: 'Avengers: Endgame added to list', category: 'navigation' },
  { type: 'playback_end', profileId: 'p_001', mediaId: 550, detail: 'Fight Club · 100% complete · 139m', category: 'playback' },
  { type: 'download_complete', profileId: 'p_002', mediaId: 603, detail: 'The Matrix · 1.38GB · 4m12s', category: 'download' },
];

const CATEGORY_COLORS: Record<StreamEvent['category'], string> = {
  playback: '#10b981',
  search: '#06b6d4',
  download: '#f97316',
  navigation: '#8b5cf6',
  error: '#ef4444',
};

function randomEvent(): StreamEvent {
  const tpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  return {
    ...tpl,
    id: Math.random().toString(36).slice(2),
    timestamp: new Date(),
  };
}

export default function TelemetryStream() {
  const [events, setEvents] = useState<StreamEvent[]>(() =>
    Array.from({ length: 6 }, randomEvent)
  );
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setEvents((prev) => [randomEvent(), ...prev].slice(0, 50));
    }, 1800);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Telemetry Stream
          </h2>
          {!paused && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => setEvents([])}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-red-700 hover:text-red-400"
          >
            <Trash2 size={11} />
            Clear
          </button>
        </div>
      </div>

      {/* Stream */}
      <div className="h-72 overflow-y-auto rounded-lg border border-zinc-800 bg-black p-3 font-mono text-xs">
        <AnimatePresence initial={false}>
          {events.map((event) => {
            const color = CATEGORY_COLORS[event.category];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-1.5 flex items-start gap-2 leading-relaxed"
              >
                <span className="shrink-0 text-zinc-600">
                  {event.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {event.type}
                </span>
                <span className="text-zinc-400">{event.detail}</span>
                <span className="ml-auto shrink-0 text-zinc-600">{event.profileId}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
          <p className="text-center text-zinc-600">No events yet</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}
