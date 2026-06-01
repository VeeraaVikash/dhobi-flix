'use client';

import { useState, useEffect } from 'react';
import PageShell, { SectionHeader } from '@/components/layout/PageShell';
import MovieGrid from '@/components/movie/MovieGrid';
import type { Movie, TVShow } from '@/types/movie';

export default function MyListPage() {
  const [myList, setMyList] = useState<(Movie | TVShow)[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dhobiflix-mylist');
    if (saved) {
      try {
        setMyList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse my list', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const handleAction = (action: 'play' | 'add' | 'like' | 'info', item: Movie | TVShow) => {
    if (action === 'add') {
      // Since it's in the list, 'add' means remove it
      const updated = myList.filter((m) => m.id !== item.id);
      setMyList(updated);
      localStorage.setItem('dhobiflix-mylist', JSON.stringify(updated));
    }
  };

  const inListMap = myList.reduce((acc, item) => {
    acc[item.id] = true;
    return acc;
  }, {} as Record<number, boolean>);

  return (
    <PageShell>
      <div className="pt-4 min-h-[50vh]">
        <SectionHeader title="My List" />
        {!isLoaded ? (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            Loading your list...
          </div>
        ) : (
          <MovieGrid
            media={myList}
            onAction={handleAction}
            inListMap={inListMap}
            emptyMessage="You haven't added any titles to your list yet."
          />
        )}
      </div>
    </PageShell>
  );
}
