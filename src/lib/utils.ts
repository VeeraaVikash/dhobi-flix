import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Tailwind Class Merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Formatters ──────────────────────────────────────────────────────────────

/** 125 → "2h 5m" | 45 → "45m" | 120 → "2h" */
export function formatRuntime(minutes: number): string {
  if (minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** "2023-07-15" → "2023" */
export function formatYear(dateString: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}

/** "2023-07-15" → "15 July 2023" (en-IN locale by default) */
export function formatDate(dateString: string, locale = 'en-IN'): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 1_500_000 → "1.4 MB" */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

/** 1500 → "1.5 Mbps" | 800 → "800 kbps" */
export function formatBitrate(kbps: number): string {
  if (kbps < 1000) return `${kbps} kbps`;
  return `${(kbps / 1000).toFixed(1)} Mbps`;
}

/** 3723 → "1:02:03" | 125 → "2:05" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** (45, 90) → 50  — clamped to [0, 100] */
export function formatProgressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

// ─── String Utils ────────────────────────────────────────────────────────────

/** "The Dark Knight!" → "the-dark-knight" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Hello World" → "Hello..." when maxLength = 8 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

// ─── ID / Random ─────────────────────────────────────────────────────────────

/** Generates a short, collision-resistant alphanumeric ID.  prefix_<ts><rand> */
export function generateId(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 11);
  const ts = Date.now().toString(36);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

// ─── Number Utils ────────────────────────────────────────────────────────────

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// ─── Function Utils ──────────────────────────────────────────────────────────

export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs: number
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: TArgs) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}

export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  intervalMs: number
): (...args: TArgs) => void {
  let lastCall = 0;
  return (...args: TArgs) => {
    const now = Date.now();
    if (now - lastCall >= intervalMs) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ─── Array Utils ─────────────────────────────────────────────────────────────

export function groupBy<T>(
  items: T[],
  key: (item: T) => string
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

export function uniqueById<T extends { id: number | string }>(items: T[]): T[] {
  const seen = new Set<number | string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/** Fisher-Yates shuffle — returns a new array */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Environment ─────────────────────────────────────────────────────────────

export const isServer = typeof window === 'undefined';

export function isTouchDevice(): boolean {
  if (isServer) return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

// ─── JSON / Query String ─────────────────────────────────────────────────────

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Builds a `?key=value` query string, omitting null/undefined values.
 * Returns "" (no leading "?") when params are empty.
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}
