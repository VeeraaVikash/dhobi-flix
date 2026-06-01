import { publicConfig } from '@/lib/config';

type PosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';
type LogoSize = 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original';
type StillSize = 'w92' | 'w185' | 'w300' | 'original';

function cleanImageBase(base: string): string {
  if (base.includes('/t/p/')) {
    const parts = base.split('/t/p/');
    return `${parts[0]}/t/p`;
  }
  return base;
}

function buildImageUrl(path: string | null | undefined, size: string): string {
  if (!path) return '/placeholder.jpg';
  const base = cleanImageBase(publicConfig.tmdb.imageBase);
  return `${base}/${size}${path}`;
}

export function getPosterUrl(path: string | null | undefined, size: PosterSize = 'w342'): string {
  return buildImageUrl(path, size);
}

export function getBackdropUrl(path: string | null | undefined, size: BackdropSize = 'w1280'): string {
  return buildImageUrl(path, size);
}

export function getProfileUrl(path: string | null | undefined, size: ProfileSize = 'w185'): string {
  return buildImageUrl(path, size);
}

export function getLogoUrl(path: string | null | undefined, size: LogoSize = 'w300'): string {
  return buildImageUrl(path, size);
}

export function getStillUrl(path: string | null | undefined, size: StillSize = 'w300'): string {
  return buildImageUrl(path, size);
}

export function getOriginalUrl(path: string | null | undefined): string {
  return buildImageUrl(path, 'original');
}

export function getPosterSrcSet(path: string | null | undefined): string {
  if (!path) return '';
  const base = cleanImageBase(publicConfig.tmdb.imageBase);
  return [
    `${base}/w185${path} 185w`,
    `${base}/w342${path} 342w`,
    `${base}/w500${path} 500w`,
    `${base}/w780${path} 780w`,
  ].join(', ');
}

export function getBackdropSrcSet(path: string | null | undefined): string {
  if (!path) return '';
  const base = cleanImageBase(publicConfig.tmdb.imageBase);
  return [
    `${base}/w300${path} 300w`,
    `${base}/w780${path} 780w`,
    `${base}/w1280${path} 1280w`,
  ].join(', ');
}

export function getOptimalPosterSize(containerWidth: number): PosterSize {
  if (containerWidth <= 92) return 'w92';
  if (containerWidth <= 154) return 'w154';
  if (containerWidth <= 185) return 'w185';
  if (containerWidth <= 342) return 'w342';
  if (containerWidth <= 500) return 'w500';
  if (containerWidth <= 780) return 'w780';
  return 'original';
}

export function getOptimalBackdropSize(containerWidth: number): BackdropSize {
  if (containerWidth <= 300) return 'w300';
  if (containerWidth <= 780) return 'w780';
  if (containerWidth <= 1280) return 'w1280';
  return 'original';
}
