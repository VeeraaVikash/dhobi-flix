export interface GenreDef {
  id: number;
  name: string;
  slug: string;
  emoji: string;
}

export const MOVIE_GENRES: GenreDef[] = [
  { id: 28,    name: 'Action',            slug: 'action',            emoji: '💥' },
  { id: 12,    name: 'Adventure',         slug: 'adventure',         emoji: '🗺️' },
  { id: 16,    name: 'Animation',         slug: 'animation',         emoji: '🎨' },
  { id: 35,    name: 'Comedy',            slug: 'comedy',            emoji: '😂' },
  { id: 80,    name: 'Crime',             slug: 'crime',             emoji: '🔫' },
  { id: 99,    name: 'Documentary',       slug: 'documentary',       emoji: '🎥' },
  { id: 18,    name: 'Drama',             slug: 'drama',             emoji: '🎭' },
  { id: 10751, name: 'Family',            slug: 'family',            emoji: '👨‍👩‍👧‍👦' },
  { id: 14,    name: 'Fantasy',           slug: 'fantasy',           emoji: '🧙' },
  { id: 36,    name: 'History',           slug: 'history',           emoji: '📜' },
  { id: 27,    name: 'Horror',            slug: 'horror',            emoji: '👻' },
  { id: 10402, name: 'Music',             slug: 'music',             emoji: '🎵' },
  { id: 9648,  name: 'Mystery',           slug: 'mystery',           emoji: '🔍' },
  { id: 10749, name: 'Romance',           slug: 'romance',           emoji: '❤️' },
  { id: 878,   name: 'Science Fiction',   slug: 'science-fiction',   emoji: '🚀' },
  { id: 10770, name: 'TV Movie',          slug: 'tv-movie',          emoji: '📺' },
  { id: 53,    name: 'Thriller',          slug: 'thriller',          emoji: '😰' },
  { id: 10752, name: 'War',               slug: 'war',               emoji: '⚔️' },
  { id: 37,    name: 'Western',           slug: 'western',           emoji: '🤠' },
];

export const TV_GENRES: GenreDef[] = [
  { id: 10759, name: 'Action & Adventure', slug: 'action-adventure', emoji: '💥' },
  { id: 16,    name: 'Animation',          slug: 'animation',        emoji: '🎨' },
  { id: 35,    name: 'Comedy',             slug: 'comedy',           emoji: '😂' },
  { id: 80,    name: 'Crime',              slug: 'crime',            emoji: '🔫' },
  { id: 99,    name: 'Documentary',        slug: 'documentary',      emoji: '🎥' },
  { id: 18,    name: 'Drama',              slug: 'drama',            emoji: '🎭' },
  { id: 10751, name: 'Family',             slug: 'family',           emoji: '👨‍👩‍👧‍👦' },
  { id: 10762, name: 'Kids',               slug: 'kids',             emoji: '🧒' },
  { id: 9648,  name: 'Mystery',            slug: 'mystery',          emoji: '🔍' },
  { id: 10763, name: 'News',               slug: 'news',             emoji: '📰' },
  { id: 10764, name: 'Reality',            slug: 'reality',          emoji: '🎙️' },
  { id: 10765, name: 'Sci-Fi & Fantasy',   slug: 'sci-fi-fantasy',   emoji: '🚀' },
  { id: 10766, name: 'Soap',               slug: 'soap',             emoji: '🫧' },
  { id: 10767, name: 'Talk',               slug: 'talk',             emoji: '🗣️' },
  { id: 10768, name: 'War & Politics',     slug: 'war-politics',     emoji: '⚔️' },
  { id: 37,    name: 'Western',            slug: 'western',          emoji: '🤠' },
];

export const MOVIE_GENRE_MAP: Record<number, GenreDef> = Object.fromEntries(
  MOVIE_GENRES.map((g) => [g.id, g])
);

export const TV_GENRE_MAP: Record<number, GenreDef> = Object.fromEntries(
  TV_GENRES.map((g) => [g.id, g])
);

export function getGenreNames(ids: number[] | undefined, type: 'movie' | 'tv' = 'movie'): string[] {
  if (!ids || !Array.isArray(ids)) return [];
  const map = type === 'movie' ? MOVIE_GENRE_MAP : TV_GENRE_MAP;
  return ids.map((id) => map[id]?.name).filter(Boolean) as string[];
}

export function getGenreById(id: number, type: 'movie' | 'tv' = 'movie'): GenreDef | undefined {
  return type === 'movie' ? MOVIE_GENRE_MAP[id] : TV_GENRE_MAP[id];
}
