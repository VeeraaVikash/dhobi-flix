import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getSimilarTV,
  getTVRecommendations,
} from '@/lib/tmdb';
import { getBackdropUrl, getPosterUrl, getProfileUrl } from '@/lib/image';
import { formatDate, truncateText } from '@/lib/utils';
import { getGenreNames } from '@/constants/genres';
import MovieActions from '@/components/movie/MovieActions';
import MovieMeta from '@/components/movie/MovieMeta';
import MovieRow from '@/components/movie/MovieRow';
import SafeImage from '@/components/movie/SafeImage';
import PageShell from '@/components/layout/PageShell';
import type { Cast, TVShow, Video } from '@/types/movie';

interface TVPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const show = await getTVDetails(Number(id));
    return {
      title: show.name,
      description: truncateText(show.overview, 160),
      openGraph: {
        title: show.name,
        description: truncateText(show.overview, 160),
        images: show.backdrop_path
          ? [{ url: getBackdropUrl(show.backdrop_path, 'w1280') }]
          : [],
      },
    };
  } catch {
    return { title: 'TV Show Not Found' };
  }
}

export default async function TVDetailPage({ params }: TVPageProps) {
  const { id } = await params;
  const tvId = Number(id);

  if (Number.isNaN(tvId)) notFound();

  let show: TVShow;
  try {
    show = { ...(await getTVDetails(tvId)), media_type: 'tv' as const };
  } catch {
    notFound();
  }

  const [creditsRes, videosRes, similarRes, recommendationsRes] = await Promise.all([
    getTVCredits(tvId).catch(() => ({ id: tvId, cast: [], crew: [] })),
    getTVVideos(tvId).catch(() => ({ id: tvId, results: [] })),
    getSimilarTV(tvId).catch(() => ({ page: 1, results: [], total_pages: 0, total_results: 0 })),
    getTVRecommendations(tvId).catch(() => ({ page: 1, results: [], total_pages: 0, total_results: 0 })),
  ]);

  const cast = creditsRes.cast.slice(0, 12);
  const trailer = videosRes.results.find(
    (v: Video) => v.type === 'Trailer' && v.site === 'YouTube'
  );
  const similar = similarRes.results
    .slice(0, 20)
    .map((item: TVShow) => ({ ...item, media_type: 'tv' as const }));
  const recommendations = recommendationsRes.results
    .slice(0, 20)
    .map((item: TVShow) => ({ ...item, media_type: 'tv' as const }));

  const backdropUrl = getBackdropUrl(show.backdrop_path, 'original');
  const posterUrl = getPosterUrl(show.poster_path, 'w500');
  const genres = show.genres?.map((g) => g.name) ?? getGenreNames(show.genre_ids, 'tv');
  const networks = show.networks?.map((network) => network.name).filter(Boolean) ?? [];

  return (
    <>
      <section className="relative w-full overflow-hidden" style={{ height: 'min(70vh, 600px)' }}>
        <SafeImage
          src={show.backdrop_path ? backdropUrl : null}
          alt={`${show.name} backdrop`}
          fill
          className="object-cover object-top"
          fallbackLabel={show.name}
          preload
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      <PageShell noTopPad>
        <div className="relative -mt-40 z-10 md:-mt-48">
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            <div className="mx-auto w-48 flex-shrink-0 md:mx-0 md:w-56">
              <div className="aspect-[2/3] overflow-hidden rounded-sm border border-zinc-800 shadow-2xl shadow-black/60">
                <SafeImage
                  src={show.poster_path ? posterUrl : null}
                  alt={show.name}
                  width={500}
                  height={750}
                  className="h-full w-full object-cover"
                  fallbackLabel={show.name}
                  loading="eager"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-5 text-center md:text-left">
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tighter text-white md:text-4xl lg:text-5xl">
                  {show.name}
                </h1>
                {show.tagline && (
                  <p className="mt-2 text-sm italic text-zinc-400 md:text-base">
                    &ldquo;{show.tagline}&rdquo;
                  </p>
                )}
              </div>

              <MovieMeta
                media={show}
                fields={['year', 'runtime', 'rating', 'language']}
                className="justify-center md:justify-start"
              />

              {genres.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-sm border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <MovieActions
                mediaId={tvId}
                mediaType="tv"
                canDownload
                className="justify-center md:justify-start"
              />

              {show.overview && (
                <div>
                  <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                    Overview
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                    {show.overview}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500 md:justify-start">
                {show.status && <span>Status: {show.status}</span>}
                {show.first_air_date && <span>First air: {formatDate(show.first_air_date)}</span>}
                {show.number_of_seasons ? <span>{show.number_of_seasons} seasons</span> : null}
                {show.number_of_episodes ? <span>{show.number_of_episodes} episodes</span> : null}
                {networks.length > 0 && <span>Network: {networks.slice(0, 2).join(', ')}</span>}
              </div>
            </div>
          </div>
        </div>

        {trailer && (
          <section className="mt-12 md:mt-16">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-white">Trailer</h2>
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </section>
        )}

        {cast.length > 0 && (
          <section className="mt-12 md:mt-16">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-white">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {cast.map((person: Cast) => (
                <div key={person.id} className="w-24 flex-shrink-0 space-y-2 text-center md:w-28">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-zinc-800 md:h-24 md:w-24">
                    <SafeImage
                      src={person.profile_path ? getProfileUrl(person.profile_path, 'w185') : null}
                      alt={person.name}
                      width={185}
                      height={185}
                      className="h-full w-full object-cover"
                      fallbackLabel={person.name[0]}
                    />
                  </div>
                  <div>
                    <p className="line-clamp-1 text-xs font-semibold text-white">{person.name}</p>
                    <p className="line-clamp-1 text-[10px] text-zinc-500">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="mt-12 md:mt-16">
            <MovieRow title="Recommended For You" media={recommendations} />
          </section>
        )}

        {similar.length > 0 && (
          <section className="mt-10 pb-6 md:mt-14">
            <MovieRow title="More Like This" media={similar} />
          </section>
        )}
      </PageShell>
    </>
  );
}
