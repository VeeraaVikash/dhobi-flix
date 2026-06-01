'use client';

import { Star, Clock, Globe, Calendar, Tv, Film } from 'lucide-react';
import { cn, formatRuntime, formatYear } from '@/lib/utils';
import { getGenreNames } from '@/constants/genres';
import type { Movie, TVShow } from '@/types/movie';

interface MovieMetaProps {
  media: Movie | TVShow;
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Which fields to show */
  fields?: ('year' | 'runtime' | 'rating' | 'genres' | 'language' | 'type')[];
  className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  pt: 'Portuguese',
  ar: 'Arabic',
  ru: 'Russian',
};

function getRuntimeMinutes(media: Movie | TVShow): number | null {
  if (media.media_type === 'movie') {
    return media.runtime ?? null;
  }
  const runtimes = media.episode_run_time;
  if (runtimes && runtimes.length > 0) {
    return runtimes[0];
  }
  return null;
}

function getYear(media: Movie | TVShow): string {
  if (media.media_type === 'movie') {
    return media.release_date ? formatYear(media.release_date) : '—';
  }
  if (!media.first_air_date) return '—';
  const start = formatYear(media.first_air_date);
  if (media.in_production) return `${start}–`;
  if (media.last_air_date) {
    const end = formatYear(media.last_air_date);
    return start === end ? start : `${start}–${end}`;
  }
  return start;
}

const DEFAULT_FIELDS: MovieMetaProps['fields'] = ['year', 'runtime', 'rating', 'genres', 'language'];

export default function MovieMeta({
  media,
  orientation = 'horizontal',
  fields = DEFAULT_FIELDS,
  className,
}: MovieMetaProps) {
  const year = getYear(media);
  const runtimeMins = getRuntimeMinutes(media);
  const rating = media.vote_average;
  const genres = getGenreNames(media.genre_ids, media.media_type as 'movie' | 'tv');
  const lang = LANGUAGE_LABELS[media.original_language] ?? media.original_language.toUpperCase();

  const isVertical = orientation === 'vertical';
  const showField = (f: string) => !fields || (fields as string[]).includes(f);

  const Dot = () => <span className="text-zinc-700 select-none">·</span>;

  if (isVertical) {
    return (
      <div className={cn('space-y-2', className)}>
        {showField('type') && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
            {media.media_type === 'movie' ? (
              <Film size={14} className="text-zinc-500" />
            ) : (
              <Tv size={14} className="text-zinc-500" />
            )}
            <span className="capitalize">{media.media_type === 'movie' ? 'Movie' : 'TV Series'}</span>
          </div>
        )}
        {showField('year') && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
            <Calendar size={14} className="text-zinc-500" />
            <span>{year}</span>
          </div>
        )}
        {showField('runtime') && runtimeMins !== null && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
            <Clock size={14} className="text-zinc-500" />
            <span>{formatRuntime(runtimeMins)}</span>
          </div>
        )}
        {showField('rating') && rating > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-white font-semibold">{rating.toFixed(1)}</span>
            <span className="text-zinc-500">/ 10</span>
            {media.vote_count > 0 && (
              <span className="text-zinc-600 text-xs">
                ({media.vote_count.toLocaleString('en-IN')})
              </span>
            )}
          </div>
        )}
        {showField('language') && (
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
            <Globe size={14} className="text-zinc-500" />
            <span>{lang}</span>
          </div>
        )}
        {showField('genres') && genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 text-xs rounded-sm bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-sm', className)}>
      {showField('rating') && rating > 0 && (
        <>
          <span className="flex items-center gap-1 font-semibold text-green-400">
            <Star size={12} fill="currentColor" />
            {rating.toFixed(1)}
          </span>
          <Dot />
        </>
      )}
      {showField('year') && (
        <>
          <span className="text-zinc-300">{year}</span>
          <Dot />
        </>
      )}
      {showField('runtime') && runtimeMins !== null && (
        <>
          <span className="text-zinc-300">{formatRuntime(runtimeMins)}</span>
          <Dot />
        </>
      )}
      {showField('language') && (
        <>
          <span className="text-zinc-400">{lang}</span>
          <Dot />
        </>
      )}
      {showField('type') && (
        <>
          <span className="text-zinc-400 capitalize">
            {media.media_type === 'movie' ? 'Movie' : 'Series'}
          </span>
          {showField('genres') && genres.length > 0 && <Dot />}
        </>
      )}
      {showField('genres') && genres.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {genres.slice(0, 3).map((g, i) => (
            <span key={g} className="text-zinc-400">
              {g}
              {i < Math.min(genres.length, 3) - 1 && <Dot />}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
