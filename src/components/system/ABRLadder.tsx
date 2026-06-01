'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap } from 'lucide-react';

interface Rendition {
  id: string;
  label: string;
  width: number;
  height: number;
  bitrate: number;
  codec: string;
  frameRate: number;
  color: string;
}

const RENDITIONS: Rendition[] = [
  { id: 'r240p',     label: '240p',       width: 426,  height: 240,  bitrate: 300,   codec: 'H.264', frameRate: 24, color: '#6366f1' },
  { id: 'r360p',     label: '360p',       width: 640,  height: 360,  bitrate: 700,   codec: 'H.264', frameRate: 24, color: '#8b5cf6' },
  { id: 'r480p',     label: '480p',       width: 854,  height: 480,  bitrate: 1200,  codec: 'H.264', frameRate: 24, color: '#06b6d4' },
  { id: 'r720p',     label: '720p HD',    width: 1280, height: 720,  bitrate: 2500,  codec: 'H.264', frameRate: 30, color: '#10b981' },
  { id: 'r720p60',   label: '720p60',     width: 1280, height: 720,  bitrate: 3500,  codec: 'H.265', frameRate: 60, color: '#14b8a6' },
  { id: 'r1080p',    label: '1080p FHD',  width: 1920, height: 1080, bitrate: 5000,  codec: 'H.264', frameRate: 30, color: '#f59e0b' },
  { id: 'r1080p60',  label: '1080p60',    width: 1920, height: 1080, bitrate: 8000,  codec: 'H.265', frameRate: 60, color: '#f97316' },
  { id: 'r1080phdr', label: '1080p HDR',  width: 1920, height: 1080, bitrate: 10000, codec: 'H.265', frameRate: 60, color: '#ef4444' },
  { id: 'r4k',       label: '4K UHD',     width: 3840, height: 2160, bitrate: 15000, codec: 'H.265', frameRate: 30, color: '#e50914' },
  { id: 'r4k60',     label: '4K 60fps',   width: 3840, height: 2160, bitrate: 20000, codec: 'AV1',   frameRate: 60, color: '#dc2626' },
  { id: 'r4khdr60',  label: '4K HDR 60',  width: 3840, height: 2160, bitrate: 25000, codec: 'AV1',   frameRate: 60, color: '#b91c1c' },
];

const MAX_BITRATE = 25000;

function formatBitrate(kbps: number): string {
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
  return `${kbps} kbps`;
}

function formatSize(width: number, height: number): string {
  return `${width}×${height}`;
}

export default function ABRLadder() {
  const [selected, setSelected] = useState<string>('r1080p');
  const [bandwidth, setBandwidth] = useState(8000);

  const autoSelected = [...RENDITIONS]
    .reverse()
    .find((r) => r.bitrate <= bandwidth * 0.8);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Layers size={16} className="text-red-500" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          ABR Ladder
        </h2>
        <span className="ml-auto text-xs text-zinc-600">
          Adaptive Bitrate Renditions
        </span>
      </div>

      {/* Bandwidth simulator */}
      <div className="mb-5 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Zap size={13} className="text-amber-400" />
            Simulated Bandwidth
          </div>
          <span className="font-mono text-sm font-semibold text-white">
            {formatBitrate(bandwidth)}
          </span>
        </div>
        <input
          type="range"
          min={200}
          max={30000}
          step={100}
          value={bandwidth}
          onChange={(e) => setBandwidth(Number(e.target.value))}
          className="w-full accent-red-600"
        />
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          Auto-select:
          {autoSelected ? (
            <span
              className="rounded-full px-2 py-0.5 font-semibold"
              style={{ backgroundColor: `${autoSelected.color}20`, color: autoSelected.color }}
            >
              {autoSelected.label}
            </span>
          ) : (
            <span className="text-red-400">Insufficient bandwidth</span>
          )}
        </div>
      </div>

      {/* Rendition bars */}
      <div className="space-y-2">
        {RENDITIONS.map((r, i) => {
          const isSelected = selected === r.id;
          const isAuto = autoSelected?.id === r.id;
          const widthPct = (r.bitrate / MAX_BITRATE) * 100;
          const withinBandwidth = r.bitrate <= bandwidth * 0.8;

          return (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(r.id)}
              className={`relative w-full overflow-hidden rounded-lg border px-4 py-2.5 text-left transition-colors ${
                isSelected
                  ? 'border-zinc-600 bg-zinc-800'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-lg opacity-10 transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: r.color }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-20 text-sm font-semibold"
                    style={{ color: withinBandwidth ? r.color : '#52525b' }}
                  >
                    {r.label}
                  </span>
                  <span className="text-xs text-zinc-500">{formatSize(r.width, r.height)}</span>
                  <span className="hidden text-xs text-zinc-600 sm:block">{r.codec}</span>
                  <span className="hidden text-xs text-zinc-600 sm:block">{r.frameRate}fps</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-400">
                    {formatBitrate(r.bitrate)}
                  </span>
                  {isAuto && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                      AUTO
                    </span>
                  )}
                  {isSelected && !isAuto && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      MANUAL
                    </span>
                  )}
                  {!withinBandwidth && (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600">
                      TOO HIGH
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-zinc-600">
        ABR auto-selects the highest rendition where bitrate ≤ 80% of available bandwidth.
      </p>
    </div>
  );
}
