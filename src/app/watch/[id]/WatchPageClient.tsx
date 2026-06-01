'use client';

import { useState, useCallback } from 'react';
import PlayerShell from '@/components/playback/PlayerShell';
import { ROUTES } from '@/constants/routes';
import { ABR_LADDER } from '@/data/abrLadder';
import { getBestEdge } from '@/data/mockEdges';
import type { PlaybackSession, PlaybackState, PlaybackRate } from '@/types/playback';

interface WatchPageClientProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

function createMockSession(mediaId: number, mediaType: 'movie' | 'tv'): PlaybackSession {
  const edge = getBestEdge();
  return {
    id: `sess_${mediaId}_${Date.now().toString(36)}`,
    profileId: 'profile_veeraa',
    accountId: 'account_001',
    mediaId,
    mediaType,
    manifest: {
      mediaId,
      mediaType,
      manifestUrl: `https://${edge.baseUrl}/hls/${mediaId}/master.m3u8`,
      drmScheme: 'widevine',
      drmLicenseUrl: `https://license.dhobiflix.in/widevine/${mediaId}`,
      renditions: ABR_LADDER.map((r) => ({
        ...r,
        label: `${r.height}p${r.frameRate > 30 ? r.frameRate : ''}`,
      })),
      audioTracks: [
        {
          id: 'audio_en',
          language: 'en',
          label: 'English',
          codec: 'aac',
          bitrate: 128,
          channels: 2,
          isDefault: true,
        },
        {
          id: 'audio_hi',
          language: 'hi',
          label: 'Hindi',
          codec: 'aac',
          bitrate: 128,
          channels: 2,
          isDefault: false,
        },
      ],
      subtitleTracks: [
        {
          id: 'sub_en',
          language: 'en',
          label: 'English',
          format: 'vtt',
          url: '/subs/en.vtt',
          isDefault: true,
          isForced: false,
          isSDH: false,
        },
        {
          id: 'sub_hi',
          language: 'hi',
          label: 'Hindi',
          format: 'vtt',
          url: '/subs/hi.vtt',
          isDefault: false,
          isForced: false,
          isSDH: false,
        },
      ],
      cdnEdgeId: edge.id,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      introStart: 5,
      introEnd: 35,
    },
    state: 'paused',
    currentTime: 0,
    duration: 7800,
    selectedRenditionId: 'r1080p',
    selectedAudioTrackId: 'audio_en',
    selectedSubtitleTrackId: null,
    playbackRate: 1.0,
    volume: 0.8,
    isMuted: false,
    startedAt: new Date().toISOString(),
    lastHeartbeatAt: new Date().toISOString(),
    heartbeatIntervalMs: 30000,
  };
}

export default function WatchPageClient({ mediaId, mediaType, title }: WatchPageClientProps) {
  const [session, setSession] = useState<PlaybackSession>(() => createMockSession(mediaId, mediaType));

  const updateSession = useCallback((updates: Partial<PlaybackSession>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePlay = useCallback(() => {
    updateSession({ state: 'playing' as PlaybackState });
  }, [updateSession]);

  const handlePause = useCallback(() => {
    updateSession({ state: 'paused' as PlaybackState });
  }, [updateSession]);

  const handleSeek = useCallback(
    (seconds: number) => {
      updateSession({ currentTime: seconds });
    },
    [updateSession]
  );

  const handleVolumeChange = useCallback(
    (v: number) => {
      updateSession({ volume: v, isMuted: v === 0 });
    },
    [updateSession]
  );

  const handleMuteToggle = useCallback(() => {
    setSession((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleQualityChange = useCallback(
    (renditionId: string) => {
      updateSession({ selectedRenditionId: renditionId });
    },
    [updateSession]
  );

  const handleSubtitleChange = useCallback(
    (trackId: string | null) => {
      updateSession({ selectedSubtitleTrackId: trackId });
    },
    [updateSession]
  );

  const handleRateChange = useCallback(
    (rate: PlaybackRate) => {
      updateSession({ playbackRate: rate });
    },
    [updateSession]
  );

  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <PlayerShell
        session={session}
        title={title}
        backHref={mediaType === 'movie' ? ROUTES.MOVIE(mediaId) : ROUTES.TV(mediaId)}
        showTelemetry
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onQualityChange={handleQualityChange}
        onSubtitleChange={handleSubtitleChange}
        onRateChange={handleRateChange}
        className="w-full"
      />
    </main>
  );
}
