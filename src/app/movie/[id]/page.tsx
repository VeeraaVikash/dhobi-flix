import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieRecommendations,
} from '@/lib/tmdb';
import { getBackdropUrl, getPosterUrl, getProfileUrl } from '@/lib/image';
import { formatRuntime, formatYear, formatDate, truncateText } from '@/lib/utils';
import { getGenreNames } from '@/constants/genres';
import { ROUTES } from '@/constants/routes';
import MovieActions from '@/components/movie/MovieActions';
import MovieMeta from '@/components/movie/MovieMeta';
import MovieRow from '@/components/movie/MovieRow';
import SafeImage from '@/components/movie/SafeImage';
import PageShell from '@/components/layout/PageShell';
import type { Movie, Cast, Video } from '@/types/movie';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(Number(id));
    return {
      title: movie.title,
      description: truncateText(movie.overview, 160),
      openGraph: {
        title: movie.title,
        description: truncateText(movie.overview, 160),
        images: movie.backdrop_path
          ? [{ url: getBackdropUrl(movie.backdrop_path, 'w1280') }]
          : [],
      },
    };
  } catch {
    return { title: 'Movie Not Found' };
  }
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  let movie: Movie;
  try {
    movie = { ...(await getMovieDetails(movieId)), media_type: 'movie' as const };
  } catch {
    notFound();
  }

  const [creditsRes, videosRes, similarRes, recommendationsRes] = await Promise.all([
    getMovieCredits(movieId).catch(() => ({ id: movieId, cast: [], crew: [] })),
    getMovieVideos(movieId).catch(() => ({ id: movieId, results: [] })),
    getSimilarMovies(movieId).catch(() => ({ page: 1, results: [], total_pages: 0, total_results: 0 })),
    getMovieRecommendations(movieId).catch(() => ({ page: 1, results: [], total_pages: 0, total_results: 0 })),
  ]);

  const cast = creditsRes.cast.slice(0, 12);
  const director = creditsRes.crew.find((c) => c.job === 'Director');
  const trailer = videosRes.results.find(
    (v: Video) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  const similar = similarRes.results
    .slice(0, 20)
    .map((m: Movie) => ({ ...m, media_type: 'movie' as const }));
  const recommendations = recommendationsRes.results
    .slice(0, 20)
    .map((m: Movie) => ({ ...m, media_type: 'movie' as const }));

  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original');
  const posterUrl = getPosterUrl(movie.poster_path, 'w500');
  const genres = movie.genres?.map((g) => g.name) ?? getGenreNames(movie.genre_ids);

  return (
    <>
      {/* Backdrop Hero */}
      <section className="relative w-full overflow-hidden" style={{ height: 'min(70vh, 600px)' }}>
        <SafeImage
          src={movie.backdrop_path ? backdropUrl : null}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover object-top"
          fallbackLabel={movie.title}
          preload
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      <PageShell noTopPad>
        {/* Movie Info Grid */}
        <div className="relative -mt-40 md:-mt-48 z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Poster */}
            <div className="flex-shrink-0 w-48 md:w-56 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-sm overflow-hidden shadow-2xl shadow-black/60 border border-zinc-800">
                <SafeImage
                  src={movie.poster_path ? posterUrl : null}
                  alt={movie.title}
                  width={500}
                  height={750}
                  className="w-full h-full object-cover"
                  fallbackLabel={movie.title}
                  loading="eager"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-5 text-center md:text-left">
              {/* Title */}
              <div>
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-zinc-400 text-sm md:text-base italic mt-2">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Meta */}
              <MovieMeta
                media={movie}
                fields={['year', 'runtime', 'rating', 'language']}
                className="justify-center md:justify-start"
              />

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 text-xs rounded-sm bg-zinc-800 text-zinc-300 border border-zinc-700"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <MovieActions
                mediaId={movieId}
                mediaType="movie"
                canDownload
                className="justify-center md:justify-start"
              />

              {/* Overview */}
              {movie.overview && (
                <div>
                  <h2 className="text-white text-sm font-bold uppercase tracking-wider mb-2">
                    Overview
                  </h2>
                  <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-2xl">
                    {movie.overview}
                  </p>
                </div>
              )}

              {/* Director */}
              {director && (
                <p className="text-zinc-500 text-sm">
                  <span className="text-zinc-400 font-semibold">Director:</span>{' '}
                  {director.name}
                </p>
              )}

              {/* Extra Info */}
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                {movie.status && <span>Status: {movie.status}</span>}
                {movie.release_date && (
                  <span>Release: {formatDate(movie.release_date)}</span>
                )}
                {movie.budget && movie.budget > 0 && (
                  <span>Budget: ${(movie.budget / 1_000_000).toFixed(0)}M</span>
                )}
                {movie.revenue && movie.revenue > 0 && (
                  <span>Revenue: ${(movie.revenue / 1_000_000).toFixed(0)}M</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {trailer && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-white text-lg font-bold tracking-tight mb-4">Trailer</h2>
            <div className="relative w-full max-w-3xl aspect-video rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="text-white text-lg font-bold tracking-tight mb-4">Cast</h2>
            <div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: 'none' }}
            >
              {cast.map((person: Cast) => (
                <div
                  key={person.id}
                  className="flex-shrink-0 w-24 md:w-28 text-center space-y-2"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-800 mx-auto">
                    <SafeImage
                      src={person.profile_path ? getProfileUrl(person.profile_path, 'w185') : null}
                      alt={person.name}
                      width={185}
                      height={185}
                      className="w-full h-full object-cover"
                      fallbackLabel={person.name[0]}
                    />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold line-clamp-1">{person.name}</p>
                    <p className="text-zinc-500 text-[10px] line-clamp-1">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-12 md:mt-16">
            <MovieRow title="Recommended For You" media={recommendations} />
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-10 md:mt-14 pb-6">
            <MovieRow title="More Like This" media={similar} />
          </section>
        )}
      </PageShell>
    </>
  );
}
