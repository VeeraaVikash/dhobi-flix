import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/lib/tmdb';
import { truncateText } from '@/lib/utils';
import WatchPageClient from './WatchPageClient';

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(Number(id));
    return {
      title: `Watch ${movie.title}`,
      description: truncateText(movie.overview, 120),
    };
  } catch {
    return { title: 'Watch' };
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const mediaId = Number(id);

  if (isNaN(mediaId)) notFound();

  let title = 'Unknown Title';
  try {
    const movie = await getMovieDetails(mediaId);
    title = movie.title;
  } catch {
    // Use fallback title
  }

  return <WatchPageClient mediaId={mediaId} title={title} />;
}
