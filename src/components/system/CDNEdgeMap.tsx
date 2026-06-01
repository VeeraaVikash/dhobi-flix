'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, CheckCircle2, XCircle, Globe, Zap, Activity } from 'lucide-react';

interface EdgeNode {
  id: string;
  label: string;
  region: string;
  city: string;
  country: string;
  latencyMs: number;
  bandwidthGbps: number;
  healthy: boolean;
  baseUrl: string;
  load: number;
}

const EDGES: EdgeNode[] = [
  { id: 'edge_mum1', label: 'Mumbai Primary',   region: 'ap-south-1',     city: 'Mumbai',    country: 'IN', latencyMs: 12,  bandwidthGbps: 40,  healthy: true,  baseUrl: 'cdn1.mum.dhobiflix.in', load: 62 },
  { id: 'edge_mum2', label: 'Mumbai Secondary', region: 'ap-south-1',     city: 'Mumbai',    country: 'IN', latencyMs: 15,  bandwidthGbps: 20,  healthy: true,  baseUrl: 'cdn2.mum.dhobiflix.in', load: 41 },
  { id: 'edge_hyd1', label: 'Hyderabad',        region: 'ap-south-2',     city: 'Hyderabad', country: 'IN', latencyMs: 28,  bandwidthGbps: 20,  healthy: true,  baseUrl: 'cdn1.hyd.dhobiflix.in', load: 33 },
  { id: 'edge_che1', label: 'Chennai',          region: 'ap-south-3',     city: 'Chennai',   country: 'IN', latencyMs: 22,  bandwidthGbps: 20,  healthy: true,  baseUrl: 'cdn1.che.dhobiflix.in', load: 55 },
  { id: 'edge_sgp1', label: 'Singapore',        region: 'ap-southeast-1', city: 'Singapore', country: 'SG', latencyMs: 65,  bandwidthGbps: 100, healthy: true,  baseUrl: 'cdn1.sgp.dhobiflix.in', load: 28 },
  { id: 'edge_dub1', label: 'Dublin',           region: 'eu-west-1',      city: 'Dublin',    country: 'IE', latencyMs: 140, bandwidthGbps: 100, healthy: true,  baseUrl: 'cdn1.dub.dhobiflix.in', load: 19 },
  { id: 'edge_iad1', label: 'Ashburn',          region: 'us-east-1',      city: 'Ashburn',   country: 'US', latencyMs: 175, bandwidthGbps: 100, healthy: true,  baseUrl: 'cdn1.iad.dhobiflix.in', load: 45 },
  { id: 'edge_pdx1', label: 'Portland',         region: 'us-west-2',      city: 'Portland',  country: 'US', latencyMs: 210, bandwidthGbps: 40,  healthy: false, baseUrl: 'cdn1.pdx.dhobiflix.in', load: 0  },
];

function LoadBar({ value, healthy }: { value: number; healthy: boolean }) {
  const color = !healthy ? '#52525b' : value > 80 ? '#ef4444' : value > 60 ? '#f59e0b' : '#10b981';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default function CDNEdgeMap() {
  const [selected, setSelected] = useState<string | null>('edge_mum1');
  const selectedEdge = EDGES.find((e) => e.id === selected);
  const healthyCount = EDGES.filter((e) => e.healthy).length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            CDN Edge Nodes
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-emerald-400">{healthyCount}/{EDGES.length} online</span>
          <span className="flex items-center gap-1 text-zinc-500">
            <Wifi size={11} />
            Mock HLS/Widevine
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {EDGES.map((edge) => {
          const isSelected = selected === edge.id;
          return (
            <motion.button
              key={edge.id}
              onClick={() => setSelected(isSelected ? null : edge.id)}
              whileHover={{ scale: 1.01 }}
              className={`rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-red-700 bg-zinc-900'
                  : edge.healthy
                  ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  : 'border-zinc-800/50 bg-zinc-900/50 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {edge.healthy ? (
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  ) : (
                    <XCircle size={13} className="text-red-500" />
                  )}
                  <span className="text-sm font-medium text-white">{edge.label}</span>
                  <span className="text-xs text-zinc-600">{edge.country}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Zap size={10} />
                  {edge.latencyMs}ms
                </div>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex justify-between text-xs text-zinc-600">
                  <span>{edge.region}</span>
                  <span>{edge.load}% load</span>
                </div>
                <LoadBar value={edge.load} healthy={edge.healthy} />
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                <Activity size={10} />
                {edge.bandwidthGbps} Gbps capacity
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedEdge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Edge Detail
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                { label: 'Node ID', value: selectedEdge.id },
                { label: 'City', value: `${selectedEdge.city}, ${selectedEdge.country}` },
                { label: 'Latency', value: `${selectedEdge.latencyMs}ms` },
                { label: 'Capacity', value: `${selectedEdge.bandwidthGbps} Gbps` },
                { label: 'Status', value: selectedEdge.healthy ? 'Online' : 'Offline' },
                { label: 'Load', value: `${selectedEdge.load}%` },
                { label: 'Protocol', value: 'HLS / DASH' },
                { label: 'DRM', value: 'Mock Widevine' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="mt-0.5 font-mono text-xs text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded bg-black px-3 py-2 font-mono text-xs text-zinc-400">
              https://{selectedEdge.baseUrl}/hls/manifest.m3u8
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
