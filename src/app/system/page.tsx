import type { Metadata } from 'next';
import PageShell from '@/components/layout/PageShell';
import ServiceHealthGrid from '@/components/system/ServiceHealthGrid';
import CDNEdgeMap from '@/components/system/CDNEdgeMap';
import ABRLadder from '@/components/system/ABRLadder';
import ArchitectureMap from '@/components/system/ArchitectureMap';
import TelemetryStream from '@/components/system/TelemetryStream';
import { Server } from 'lucide-react';

export const metadata: Metadata = {
  title: 'System Status',
  description:
    'DhobiFlix system architecture, service health, CDN edges, ABR ladder, and live telemetry stream.',
};

export default function SystemPage() {
  return (
    <PageShell>
      <div className="space-y-10 pt-4 md:pt-8 pb-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e50914]/10 flex items-center justify-center">
            <Server size={20} className="text-[#e50914]" />
          </div>
          <div>
            <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight">
              System Status
            </h1>
            <p className="text-zinc-500 text-sm">
              Infrastructure overview &amp; monitoring dashboard
            </p>
          </div>
        </div>

        {/* Architecture Map */}
        <section>
          <ArchitectureMap />
        </section>

        {/* Service Health */}
        <section>
          <ServiceHealthGrid />
        </section>

        {/* CDN Edge Nodes */}
        <section>
          <CDNEdgeMap />
        </section>

        {/* ABR Ladder */}
        <section>
          <ABRLadder />
        </section>

        {/* Telemetry Stream */}
        <section>
          <TelemetryStream />
        </section>
      </div>
    </PageShell>
  );
}
