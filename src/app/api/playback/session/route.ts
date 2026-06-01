export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getTVEpisodeDetails } from '@/lib/tmdb';
import {
  createPlaybackSession,
  validatePlaybackRequest,
} from '@/services/playback.service';
import { HTTP_STATUS } from '@/constants/app';
import type { PlaybackSessionCreateRequest } from '@/types/playback';

export async function POST(req: NextRequest) {
  let body: PlaybackSessionCreateRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const validationError = validatePlaybackRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  try {
    let durationSeconds = 0;

    if (body.mediaType === 'movie') {
      const movie = await getMovieDetails(body.mediaId);
      durationSeconds = (movie.runtime ?? 0) * 60;
    } else if (
      body.mediaType === 'tv' &&
      body.seasonNumber != null &&
      body.episodeNumber != null
    ) {
      const episode = await getTVEpisodeDetails(
        body.mediaId,
        body.seasonNumber,
        body.episodeNumber
      );
      durationSeconds = (episode.runtime ?? 0) * 60;
    }

    const session = createPlaybackSession(body, durationSeconds);

    return NextResponse.json(
      { session },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (err) {
    console.error('[playback/session] error:', err);
    return NextResponse.json(
      { error: 'Failed to create playback session' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
