import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import { truncateText } from '@/lib/utils';
import WatchPageClient from './WatchPageClient';

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const mediaType = type === 'tv' ? 'tv' : 'movie';

  try {
    if (mediaType === 'tv') {
      const show = await getTVDetails(Number(id));
      return {
        title: `Watch ${show.name}`,
        description: truncateText(show.overview, 120),
      };
    }

    const movie = await getMovieDetails(Number(id));

    return {
      title: `Watch ${movie.title}`,
      description: truncateText(movie.overview, 120),
    };
  } catch {
    return { title: 'Watch' };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const mediaId = Number(id);
  const mediaType = type === 'tv' ? 'tv' : 'movie';

  if (isNaN(mediaId)) notFound();

  let title = 'Unknown Title';
  try {
    if (mediaType === 'tv') {
      const show = await getTVDetails(mediaId);
      title = show.name;
    } else {
      const movie = await getMovieDetails(mediaId);
      title = movie.title;
    }
  } catch {
    // Use fallback title
  }

  return <WatchPageClient mediaId={mediaId} mediaType={mediaType} title={title} />;
}
