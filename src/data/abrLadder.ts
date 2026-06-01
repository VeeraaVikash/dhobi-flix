import type { Rendition } from '@/types/playback';
import type { DownloadQuality, DownloadQualitySpec } from '@/types/download';

export const ABR_LADDER: Rendition[] = [
  { id: 'r240p',    width: 426,  height: 240,  bitrate: 300,   codec: 'h264', frameRate: 24, label: '240p' },
  { id: 'r360p',    width: 640,  height: 360,  bitrate: 700,   codec: 'h264', frameRate: 24, label: '360p' },
  { id: 'r480p',    width: 854,  height: 480,  bitrate: 1200,  codec: 'h264', frameRate: 24, label: '480p' },
  { id: 'r720p',    width: 1280, height: 720,  bitrate: 2500,  codec: 'h264', frameRate: 30, label: '720p' },
  { id: 'r720p60',  width: 1280, height: 720,  bitrate: 3500,  codec: 'h265', frameRate: 60, label: '720p60' },
  { id: 'r1080p',   width: 1920, height: 1080, bitrate: 5000,  codec: 'h264', frameRate: 30, label: '1080p' },
  { id: 'r1080p60', width: 1920, height: 1080, bitrate: 8000,  codec: 'h265', frameRate: 60, label: '1080p60' },
  { id: 'r1080phdr',width: 1920, height: 1080, bitrate: 10000, codec: 'h265', frameRate: 60, label: '1080p HDR' },
  { id: 'r4k',      width: 3840, height: 2160, bitrate: 15000, codec: 'h265', frameRate: 30, label: '4K' },
  { id: 'r4k60',    width: 3840, height: 2160, bitrate: 20000, codec: 'av1',  frameRate: 60, label: '4K60' },
  { id: 'r4khdr60', width: 3840, height: 2160, bitrate: 25000, codec: 'av1',  frameRate: 60, label: '4K HDR' },
];

export const DOWNLOAD_QUALITY_SPECS: Record<DownloadQuality, DownloadQualitySpec> = {
  standard: { quality: 'standard', label: 'Standard', maxBitrateKbps: 2500,  maxResolution: '720p',  estimatedMbPerHour: 700  },
  high:     { quality: 'high',     label: 'High',     maxBitrateKbps: 5000,  maxResolution: '1080p', estimatedMbPerHour: 1400 },
  ultra:    { quality: 'ultra',    label: 'Ultra HD', maxBitrateKbps: 15000, maxResolution: '4K',    estimatedMbPerHour: 4200 },
};

const QUALITY_TO_RENDITION: Record<DownloadQuality, string> = {
  standard: 'r720p',
  high: 'r1080p',
  ultra: 'r4k',
};

export function getRenditionById(id: string): Rendition | undefined {
  return ABR_LADDER.find((r) => r.id === id);
}

/** Select the highest rendition whose bitrate fits within 80% of available bandwidth (kbps). */
export function selectRenditionForBandwidth(bandwidthKbps: number): Rendition {
  const budget = bandwidthKbps * 0.8;
  const eligible = ABR_LADDER.filter((r) => r.bitrate <= budget);
  if (eligible.length === 0) return ABR_LADDER[0];
  return eligible[eligible.length - 1];
}

/** Return renditions whose resolution is at or below the plan maximum. */
export function getRenditionsForPlan(maxRes: '480p' | '720p' | '1080p' | '4K'): Rendition[] {
  const heightCap: Record<string, number> = {
    '480p': 480,
    '720p': 720,
    '1080p': 1080,
    '4K': 2160,
  };
  const cap = heightCap[maxRes] ?? 480;
  return ABR_LADDER.filter((r) => r.height <= cap);
}

/** Return the rendition to use for a given download quality setting. */
export function getDownloadRendition(quality: DownloadQuality): Rendition {
  const renditionId = QUALITY_TO_RENDITION[quality];
  return getRenditionById(renditionId) ?? ABR_LADDER[0];
}

/** Estimate download file size in bytes. durationSeconds × bitrate / 8 × 1000. */
export function estimateDownloadSize(quality: DownloadQuality, durationSeconds: number): number {
  const spec = DOWNLOAD_QUALITY_SPECS[quality];
  return Math.round((spec.maxBitrateKbps * 1000 * durationSeconds) / 8);
}
