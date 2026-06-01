export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { processBatch, detectAnomalies, summarizeBatch } from '@/services/telemetry.service';
import { HTTP_STATUS, TELEMETRY } from '@/constants/app';
import type { TelemetryBatchRequest } from '@/types/telemetry';

export async function POST(req: NextRequest) {
  let body: TelemetryBatchRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  if (!Array.isArray(body.events)) {
    return NextResponse.json(
      { error: 'events must be an array' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  if (body.events.length > TELEMETRY.MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Batch size exceeds maximum of ${TELEMETRY.MAX_BATCH_SIZE}` },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const response = processBatch(body);
  const anomalies = detectAnomalies(body.events);
  const summary = summarizeBatch(body.events);

  if (anomalies.length > 0) {
    console.warn('[telemetry] anomalies detected:', anomalies);
  }

  return NextResponse.json({
    ...response,
    summary,
    anomalies: anomalies.length > 0 ? anomalies : undefined,
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'telemetry',
    maxBatchSize: TELEMETRY.MAX_BATCH_SIZE,
    maxQueueSize: TELEMETRY.MAX_QUEUE_SIZE,
    timestamp: new Date().toISOString(),
  });
}
