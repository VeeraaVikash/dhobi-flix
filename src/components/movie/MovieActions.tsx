'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  Plus,
  Check,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Info,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface MovieActionsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  /** Whether item is already in My List */
  isInList?: boolean;
  /** Whether the user already liked this */
  isLiked?: boolean;
  /** Whether the user already disliked this */
  isDisliked?: boolean;
  /** Whether download is available */
  canDownload?: boolean;
  /** Layout variant */
  variant?: 'detail' | 'hero' | 'compact';
  onToggleList?: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  onRate?: (mediaId: number, mediaType: 'movie' | 'tv', value: 'up' | 'down') => void;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function ActionButton({
  icon,
  label,
  onClick,
  href,
  active = false,
  variant = 'outline',
  size = 'md',
  className,
}: ActionButtonProps) {
  const sizeMap = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const variantMap = {
    primary:
      'bg-white text-black hover:bg-zinc-200',
    outline: cn(
      'border-2 text-white transition-colors',
      active
        ? 'border-[#e50914] text-[#e50914]'
        : 'border-zinc-500 hover:border-white'
    ),
    ghost:
      'text-zinc-400 hover:text-white hover:bg-white/10',
  };

  const baseClass = cn(
    'rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 group/btn',
    sizeMap[size],
    variantMap[variant],
    className
  );

  const content = (
    <>
      {icon}
      <span className="sr-only">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClass} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass} aria-label={label}>
      {content}
    </button>
  );
}

export default function MovieActions({
  mediaId,
  mediaType,
  isInList = false,
  isLiked = false,
  isDisliked = false,
  canDownload = false,
  variant = 'detail',
  onToggleList,
  onRate,
  onShare,
  onDownload,
  className,
}: MovieActionsProps) {
  const [listState, setListState] = useState(isInList);
  const [ratingState, setRatingState] = useState<'up' | 'down' | null>(
    isLiked ? 'up' : isDisliked ? 'down' : null
  );

  const watchHref =
    mediaType === 'movie'
      ? ROUTES.WATCH_MOVIE(mediaId)
      : ROUTES.WATCH_TV(mediaId, 1, 1);

  const detailHref =
    mediaType === 'movie' ? ROUTES.MOVIE(mediaId) : ROUTES.TV(mediaId);

  const handleToggleList = () => {
    setListState((v) => !v);
    onToggleList?.(mediaId, mediaType);
  };

  const handleRate = (value: 'up' | 'down') => {
    const next = ratingState === value ? null : value;
    setRatingState(next);
    if (next) onRate?.(mediaId, mediaType, next);
  };

  if (variant === 'hero') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href={watchHref}
            className="flex items-center gap-2 px-6 py-3 bg-[#e50914] text-white rounded-sm font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            <Play size={18} fill="currentColor" />
            Play
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.96 }}>
          <Link
            href={detailHref}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-600/70 text-white rounded-sm font-bold text-sm hover:bg-zinc-600 transition-colors backdrop-blur-sm"
          >
            <Info size={18} />
            More Info
          </Link>
        </motion.div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <ActionButton
          icon={<Play size={16} fill="currentColor" />}
          label="Play"
          href={watchHref}
          variant="primary"
          size="sm"
        />
        <ActionButton
          icon={listState ? <Check size={14} /> : <Plus size={14} />}
          label={listState ? 'Remove from My List' : 'Add to My List'}
          onClick={handleToggleList}
          active={listState}
          variant="outline"
          size="sm"
        />
      </div>
    );
  }

  // detail variant
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Play */}
      <motion.div whileTap={{ scale: 0.95 }}>
        <Link
          href={watchHref}
          className="flex items-center gap-2.5 pl-5 pr-6 py-3 bg-[#e50914] text-white rounded-sm font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
        >
          <Play size={20} fill="currentColor" />
          Play
        </Link>
      </motion.div>

      {/* My List */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleList}
        className={cn(
          'w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          listState
            ? 'border-[#e50914] text-[#e50914]'
            : 'border-zinc-500 text-white hover:border-white'
        )}
        aria-label={listState ? 'Remove from My List' : 'Add to My List'}
      >
        <motion.div
          key={listState ? 'check' : 'plus'}
          initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {listState ? <Check size={18} /> : <Plus size={18} />}
        </motion.div>
      </motion.button>

      {/* Like */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleRate('up')}
        className={cn(
          'w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          ratingState === 'up'
            ? 'border-green-500 text-green-500'
            : 'border-zinc-500 text-white hover:border-white'
        )}
        aria-label="Like"
        aria-pressed={ratingState === 'up'}
      >
        <ThumbsUp size={16} />
      </motion.button>

      {/* Dislike */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => handleRate('down')}
        className={cn(
          'w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          ratingState === 'down'
            ? 'border-red-400 text-red-400'
            : 'border-zinc-500 text-white hover:border-white'
        )}
        aria-label="Not for me"
        aria-pressed={ratingState === 'down'}
      >
        <ThumbsDown size={16} />
      </motion.button>

      {/* Download */}
      {canDownload && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDownload}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-200 shadow-xl"
          aria-label="Download"
        >
          <Download size={16} />
        </motion.button>
      )}

      {/* Share */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onShare}
        className="w-11 h-11 rounded-full border-2 border-zinc-500 text-white hover:border-white flex items-center justify-center transition-all duration-200"
        aria-label="Share"
      >
        <Share2 size={16} />
      </motion.button>
    </div>
  );
}
