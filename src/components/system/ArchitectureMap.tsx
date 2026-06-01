'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Server,
  Database,
  Search,
  Play,
  Download,
  BarChart2,
  User,
  ArrowRight,
  Wifi,
  Shield,
} from 'lucide-react';

interface ServiceNode {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  x: number;
  y: number;
  connections: string[];
}

const NODES: ServiceNode[] = [
  {
    id: 'client',
    label: 'Client Browser',
    sublabel: 'Next.js App Router',
    icon: <Globe size={18} />,
    color: '#e50914',
    x: 50,
    y: 5,
    connections: ['gateway'],
  },
  {
    id: 'gateway',
    label: 'BFF Gateway',
    sublabel: 'Route Handlers',
    icon: <Shield size={18} />,
    color: '#f59e0b',
    x: 50,
    y: 25,
    connections: ['personalization', 'search', 'playback', 'downloads', 'telemetry'],
  },
  {
    id: 'personalization',
    label: 'Personalization',
    sublabel: 'Ranking Engine',
    icon: <User size={18} />,
    color: '#8b5cf6',
    x: 10,
    y: 50,
    connections: ['tmdb'],
  },
  {
    id: 'search',
    label: 'Search Service',
    sublabel: 'Query + Rank',
    icon: <Search size={18} />,
    color: '#06b6d4',
    x: 30,
    y: 50,
    connections: ['tmdb'],
  },
  {
    id: 'playback',
    label: 'Playback Service',
    sublabel: 'Session + ABR',
    icon: <Play size={18} />,
    color: '#10b981',
    x: 50,
    y: 50,
    connections: ['tmdb', 'cdn'],
  },
  {
    id: 'downloads',
    label: 'Downloads',
    sublabel: 'Offline Manager',
    icon: <Download size={18} />,
    color: '#f97316',
    x: 70,
    y: 50,
    connections: ['tmdb'],
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    sublabel: 'Event Pipeline',
    icon: <BarChart2 size={18} />,
    color: '#ec4899',
    x: 90,
    y: 50,
    connections: [],
  },
  {
    id: 'tmdb',
    label: 'TMDB API',
    sublabel: 'Movie Metadata',
    icon: <Database size={18} />,
    color: '#6366f1',
    x: 30,
    y: 80,
    connections: [],
  },
  {
    id: 'cdn',
    label: 'CDN Edge',
    sublabel: 'Mock Widevine / HLS',
    icon: <Wifi size={18} />,
    color: '#14b8a6',
    x: 65,
    y: 80,
    connections: [],
  },
];

const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

export default function ArchitectureMap() {
  const [active, setActive] = useState<string | null>(null);
  const activeNode = active ? nodeMap[active] : null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Server size={16} className="text-red-500" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          System Architecture
        </h2>
      </div>

      {/* SVG map */}
      <div className="relative w-full overflow-hidden rounded-lg border border-zinc-800 bg-black">
        <svg viewBox="0 0 100 95" className="w-full" style={{ minHeight: 320 }}>
          {/* Draw connection lines */}
          {NODES.flatMap((node) =>
            node.connections.map((targetId) => {
              const target = nodeMap[targetId];
              if (!target) return null;
              const isHighlighted =
                active === node.id || active === targetId;
              return (
                <motion.line
                  key={`${node.id}-${targetId}`}
                  x1={node.x}
                  y1={node.y + 3}
                  x2={target.x}
                  y2={target.y - 3}
                  stroke={isHighlighted ? node.color : '#27272a'}
                  strokeWidth={isHighlighted ? 0.6 : 0.3}
                  strokeDasharray={isHighlighted ? '0' : '1 1'}
                  animate={{ opacity: isHighlighted ? 1 : 0.5 }}
                />
              );
            })
          )}

          {/* Draw nodes */}
          {NODES.map((node) => {
            const isActive = active === node.id;
            const isConnected =
              active !== null &&
              (nodeMap[active]?.connections.includes(node.id) ||
                node.connections.includes(active));

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => setActive(isActive ? null : node.id)}
              >
                <motion.circle
                  r={isActive ? 5 : 3.5}
                  fill={isActive || isConnected ? node.color : '#18181b'}
                  stroke={node.color}
                  strokeWidth={isActive ? 0.8 : 0.4}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                <text
                  y={7}
                  textAnchor="middle"
                  fill={isActive ? node.color : '#a1a1aa'}
                  fontSize={2.8}
                  fontWeight={isActive ? 'bold' : 'normal'}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${activeNode.color}22`, color: activeNode.color }}
              >
                {activeNode.icon}
              </div>
              <div>
                <p className="font-semibold text-white">{activeNode.label}</p>
                <p className="text-xs text-zinc-500">{activeNode.sublabel}</p>
              </div>
            </div>

            {activeNode.connections.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-zinc-500">Connects to</p>
                <div className="flex flex-wrap gap-2">
                  {activeNode.connections.map((id) => {
                    const target = nodeMap[id];
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                        style={{ borderColor: target.color, color: target.color }}
                      >
                        <ArrowRight size={10} />
                        {target.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-center text-xs text-zinc-600">
        Click any node to explore connections
      </p>
    </div>
  );
}
