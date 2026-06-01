'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Calendar,
  Download,
} from 'lucide-react';
import { getPosterUrl } from '@/lib/image';
import { cn, formatBytes, formatDuration, formatDate } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import SafeImage from '@/components/movie/SafeImage';
import type { Download as DownloadType } from '@/types/download';

interface DownloadCardProps {
  download: DownloadType;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  DownloadType['status'],
  { label: string; color: string; icon: React.ElementType }
> = {
  queued: { label: 'Queued', color: 'text-zinc-400', icon: Clock },
  downloading: { label: 'Downloading', color: 'text-blue-400', icon: Download },
  paused: { label: 'Paused', color: 'text-yellow-400', icon: Pause },
  completed: { label: 'Downloaded', color: 'text-green-400', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-400', icon: AlertCircle },
  expired: { label: 'Expired', color: 'text-zinc-600', icon: AlertCircle },
};

const QUALITY_LABELS: Record<string, string> = {
  standard: 'Standard',
  high: 'High',
  ultra: 'Ultra HD',
};

function getWatchHref(d: DownloadType): string {
  if (d.mediaType === 'movie') return ROUTES.WATCH_MOVIE(d.mediaId);
  const s = d.seasonNumber ?? 1;
  const e = d.episodeNumber ?? 1;
  return ROUTES.WATCH_TV(d.mediaId, s, e);
}

export default function DownloadCard({
  download,
  onPause,
  onResume,
  onDelete,
  onRetry,
  className,
}: DownloadCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    id, title, posterPath, quality, status, progressPercent,
    fileSizeBytes, downloadedBytes, durationSeconds, expiresAt,
    episodeNumber, seasonNumber, mediaType,
  } = download;

  const statusCfg = STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;
  const isActive = status === 'downloading' || status === 'queued';
  const canPlay = status === 'completed';
  const canPause = status === 'downloading';
  const canResume = status === 'paused' || status === 'failed';
  const canDelete = true;

  const episodeLabel =
    mediaType === 'tv' && seasonNumber && episodeNumber
      ? `S${seasonNumber} E${episodeNumber}`
      : null;

  const expiryDate = formatDate(expiresAt);
  const daysLeft = Math.max(0, Math.round(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));
  const expiryColor = daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-zinc-500';

  const watchHref = getWatchHref(download);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex gap-4 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-sm',
        'hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 group',
        status === 'expired' && 'opacity-50',
        className
      )}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-[60px] h-[90px] relative rounded-sm overflow-hidden bg-zinc-800">
        <SafeImage
          src={posterPath ? getPosterUrl(posterPath, 'w154') : null}
          alt={title}
          fill
          className="object-cover"
          fallbackLabel={title}
          sizes="60px"
        />
        {/* Play overlay */}
        {canPlay && (
          <Link
            href={watchHref}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title + Status */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{title}</p>
            {episodeLabel && (
              <p className="text-zinc-500 text-xs mt-0.5">{episodeLabel}</p>
            )}
          </div>
          <div className={cn('flex items-center gap-1 flex-shrink-0 text-xs font-medium', statusCfg.color)}>
            <StatusIcon size={12} />
            <span>{statusCfg.label}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {(isActive || status === 'paused') && (
          <div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#e50914] rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span>{progressPercent.toFixed(0)}%</span>
              <span>{formatBytes(downloadedBytes)} / {formatBytes(fileSizeBytes)}</span>
            </div>
          </div>
        )}

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <HardDrive size={10} />
            {status === 'completed' ? formatBytes(fileSizeBytes) : formatBytes(fileSizeBytes)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDuration(durationSeconds)}
          </span>
          <span className="px-1.5 py-0.5 bg-zinc-800 rounded-sm text-zinc-400 text-[10px] font-medium">
            {QUALITY_LABELS[quality] ?? quality}
          </span>
          {status === 'completed' && (
            <span className={cn('flex items-center gap-1', expiryColor)}>
              <Calendar size={10} />
              {daysLeft > 0 ? `${daysLeft}d left` : 'Expires today'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canPlay && (
            <Link
              href={watchHref}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-sm hover:bg-zinc-200 transition-colors"
            >
              <Play size={11} fill="currentColor" />
              Play
            </Link>
          )}
          {canPause && (
            <button
              onClick={() => onPause?.(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-sm hover:bg-zinc-700 transition-colors"
            >
              <Pause size={11} />
              Pause
            </button>
          )}
          {canResume && (
            <button
              onClick={() => status === 'failed' ? onRetry?.(id) : onResume?.(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-medium rounded-sm hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw size={11} />
              {status === 'failed' ? 'Retry' : 'Resume'}
            </button>
          )}

          <div className="flex-1" />

          {/* Delete */}
          {canDelete && (
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1"
                >
                  <button
                    onClick={() => { onDelete?.(id); setConfirmDelete(false); }}
                    className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-sm hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="trash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDelete(true)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors rounded-sm hover:bg-red-400/10"
                  aria-label="Delete download"
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
