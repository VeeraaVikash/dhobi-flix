'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[DhobiFlix] Unhandled error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle size={36} className="text-[#e50914]" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We encountered an unexpected error. This could be a temporary issue
            — please try again.
          </p>
        </div>

        {/* Error detail (dev only) */}
        {error.message && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3">
            <p className="text-zinc-500 text-xs font-mono break-all leading-relaxed">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-zinc-700 text-[10px] font-mono mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e50914] text-white text-sm font-bold rounded-sm hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-sm hover:bg-zinc-700 transition-colors"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
