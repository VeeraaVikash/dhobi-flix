import RowSkeleton from '@/components/home/RowSkeleton';

export default function HomeLoading() {
  return (
    <main className="bg-[#0a0a0a] min-h-screen">
      {/* Hero skeleton */}
      <div className="relative w-full overflow-hidden" style={{ height: 'min(85vh, 720px)' }}>
        <div className="absolute inset-0 bg-zinc-900 skeleton-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute bottom-16 left-4 sm:left-8 lg:left-12 space-y-4">
          <div className="h-4 w-16 bg-zinc-800 rounded skeleton-shimmer" />
          <div className="h-12 w-72 bg-zinc-800 rounded skeleton-shimmer" />
          <div className="h-4 w-48 bg-zinc-800 rounded skeleton-shimmer" />
          <div className="h-4 w-96 bg-zinc-800/60 rounded skeleton-shimmer" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-28 bg-zinc-800 rounded-sm skeleton-shimmer" />
            <div className="h-12 w-32 bg-zinc-800/60 rounded-sm skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Row skeletons */}
      <div className="mx-auto max-w-[1800px] px-4 sm:px-8 lg:px-12 space-y-10 md:space-y-14 pt-6 pb-20">
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </main>
  );
}
