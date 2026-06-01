'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  User,
  Search,
  Play,
  Download,
  BarChart2,
  Database,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: ServiceStatus;
  latencyMs: number;
  uptime: number;
  requests: number;
}

function randomLatency(base: number) {
  return base + Math.floor(Math.random() * 20 - 10);
}

function randomStatus(): ServiceStatus {
  const r = Math.random();
  if (r > 0.15) return 'healthy';
  if (r > 0.05) return 'degraded';
  return 'down';
}

function makeServices(): Service[] {
  return [
    {
      id: 'gateway',
      name: 'BFF Gateway',
      description: 'Route handlers / API layer',
      icon: <Shield size={16} />,
      status: 'healthy',
      latencyMs: randomLatency(8),
      uptime: 99.98,
      requests: 14320,
    },
    {
      id: 'personalization',
      name: 'Personalization',
      description: 'Ranking & candidate selection',
      icon: <User size={16} />,
      status: randomStatus(),
      latencyMs: randomLatency(42),
      uptime: 99.7,
      requests: 3210,
    },
    {
      id: 'search',
      name: 'Search Service',
      description: 'Query parsing & ranking',
      icon: <Search size={16} />,
      status: randomStatus(),
      latencyMs: randomLatency(35),
      uptime: 99.9,
      requests: 8750,
    },
    {
      id: 'playback',
      name: 'Playback Service',
      description: 'Session & ABR management',
      icon: <Play size={16} />,
      status: 'healthy',
      latencyMs: randomLatency(22),
      uptime: 99.95,
      requests: 5430,
    },
    {
      id: 'downloads',
      name: 'Downloads',
      description: 'Offline license management',
      icon: <Download size={16} />,
      status: randomStatus(),
      latencyMs: randomLatency(55),
      uptime: 99.5,
      requests: 1120,
    },
    {
      id: 'telemetry',
      name: 'Telemetry Pipeline',
      description: 'Event ingestion & logging',
      icon: <BarChart2 size={16} />,
      status: 'healthy',
      latencyMs: randomLatency(12),
      uptime: 99.99,
      requests: 48200,
    },
    {
      id: 'tmdb',
      name: 'TMDB API',
      description: 'External movie metadata',
      icon: <Database size={16} />,
      status: randomStatus(),
      latencyMs: randomLatency(120),
      uptime: 99.8,
      requests: 22100,
    },
    {
      id: 'cdn',
      name: 'CDN Edge',
      description: 'Mock HLS / Widevine delivery',
      icon: <Wifi size={16} />,
      status: 'healthy',
      latencyMs: randomLatency(18),
      uptime: 99.97,
      requests: 61400,
    },
  ];
}

const STATUS_CONFIG: Record<ServiceStatus, { color: string; label: string; icon: React.ReactNode }> = {
  healthy: { color: '#10b981', label: 'Healthy', icon: <CheckCircle2 size={13} /> },
  degraded: { color: '#f59e0b', label: 'Degraded', icon: <AlertCircle size={13} /> },
  down: { color: '#ef4444', label: 'Down', icon: <XCircle size={13} /> },
};

function Sparkline({ color }: { color: string }) {
  const points = Array.from({ length: 12 }, () => 20 + Math.random() * 60);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map((p) => ((p - min) / (max - min || 1)) * 30);
  const path = norm
    .map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / 11) * 80} ${35 - y}`)
    .join(' ');
  return (
    <svg viewBox="0 0 80 40" className="h-8 w-20">
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export default function ServiceHealthGrid() {
  const [services, setServices] = useState<Service[]>(makeServices);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setServices(makeServices());
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 600);
  };

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const healthy = services.filter((s) => s.status === 'healthy').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const down = services.filter((s) => s.status === 'down').length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Service Health
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-400">{healthy} healthy</span>
            {degraded > 0 && <span className="text-amber-400">{degraded} degraded</span>}
            {down > 0 && <span className="text-red-400">{down} down</span>}
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white"
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, i) => {
          const cfg = STATUS_CONFIG[service.status];
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                >
                  {service.icon}
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                  style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                >
                  {cfg.icon}
                  {cfg.label}
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-white">{service.name}</p>
              <p className="text-xs text-zinc-500">{service.description}</p>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Latency</p>
                  <p className="text-sm font-mono font-semibold text-white">
                    {service.latencyMs}
                    <span className="text-xs text-zinc-500">ms</span>
                  </p>
                  <p className="text-xs text-zinc-600">{service.uptime}% uptime</p>
                </div>
                <Sparkline color={cfg.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-3 text-right text-xs text-zinc-600">
        Last updated {lastRefresh.toLocaleTimeString()}
      </p>
    </div>
  );
}
