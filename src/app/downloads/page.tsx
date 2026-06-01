'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Filter } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import DownloadCard from '@/components/downloads/DownloadCard';
import StorageMeter from '@/components/downloads/StorageMeter';
import { MOCK_DOWNLOADS } from '@/data/mockDownloads';
import type { Download as DownloadType, DownloadStatus, DownloadStorageSummary } from '@/types/download';

type FilterTab = 'all' | 'completed' | 'downloading' | 'paused' | 'failed';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Downloaded' },
  { value: 'downloading', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'failed', label: 'Failed' },
];

function computeStorageSummary(downloads: DownloadType[]): DownloadStorageSummary {
  const totalStorageBytes = 16_000_000_000; // 16GB mock
  const usedStorageBytes = downloads.reduce((sum, d) => sum + d.downloadedBytes, 0);
  return {
    profileId: 'profile_veeraa',
    totalDownloads: downloads.length,
    completedDownloads: downloads.filter((d) => d.status === 'completed').length,
    activeDownloads: downloads.filter(
      (d) => d.status === 'downloading' || d.status === 'queued'
    ).length,
    totalStorageBytes,
    usedStorageBytes,
    availableStorageBytes: totalStorageBytes - usedStorageBytes,
  };
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadType[]>(MOCK_DOWNLOADS);
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered =
    filter === 'all'
      ? downloads
      : downloads.filter((d) => d.status === filter);

  const storageSummary = computeStorageSummary(downloads);

  const handlePause = useCallback((id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'paused' as DownloadStatus } : d))
    );
  }, []);

  const handleResume = useCallback((id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'downloading' as DownloadStatus } : d))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleRetry = useCallback((id: string) => {
    setDownloads((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'downloading' as DownloadStatus, progressPercent: 0, downloadedBytes: 0 }
          : d
      )
    );
  }, []);

  return (
    <PageShell>
      <div className="space-y-8 pt-4 md:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download size={22} className="text-[#e50914]" />
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">
              Downloads
            </h1>
          </div>
          {downloads.length > 0 && (
            <span className="text-zinc-500 text-sm">
              {downloads.length} item{downloads.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Storage Meter */}
        <StorageMeter summary={storageSummary} />

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-zinc-500 flex-shrink-0" />
          {FILTER_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex-shrink-0 ${
                filter === value
                  ? 'bg-[#e50914] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Download List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length > 0 ? (
              filtered.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onPause={handlePause}
                  onResume={handleResume}
                  onDelete={handleDelete}
                  onRetry={handleRetry}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Download size={24} className="text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">
                  {filter === 'all'
                    ? 'No downloads yet. Browse and download content for offline viewing.'
                    : `No ${filter} downloads.`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear All (only if there are completed downloads) */}
        {downloads.some((d) => d.status === 'completed') && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() =>
                setDownloads((prev) =>
                  prev.filter((d) => d.status !== 'completed')
                )
              }
              className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500 hover:text-red-400 transition-colors border border-zinc-800 rounded-sm hover:border-red-500/30"
            >
              <Trash2 size={12} />
              Remove All Completed
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
