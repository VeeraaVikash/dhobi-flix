import type {
  TelemetryBaseEvent,
  TelemetryEventType,
  TelemetryBatchRequest,
  TelemetryBatchResponse,
  TelemetryEvent,
} from '@/types/telemetry';
import { TELEMETRY } from '@/constants/app';
import { generateId } from '@/lib/utils';

// Module-level event queue
const eventQueue: TelemetryBaseEvent[] = [];

/** Create the common base fields for any telemetry event. */
export function createBaseEvent(
  overrides: Partial<TelemetryBaseEvent> & Pick<TelemetryBaseEvent, 'eventType'>
): TelemetryBaseEvent {
  return {
    eventId: generateId(),
    sessionId: overrides.sessionId ?? 'unknown',
    profileId: overrides.profileId ?? 'unknown',
    accountId: overrides.accountId ?? 'unknown',
    platform: overrides.platform ?? 'web',
    appVersion: overrides.appVersion ?? '1.0.0',
    networkType: overrides.networkType ?? 'unknown',
    deviceId: overrides.deviceId ?? 'unknown',
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Add an event to the queue. If the queue exceeds MAX_QUEUE_SIZE,
 * drop the oldest event first (ring-buffer behaviour).
 */
export function enqueueEvent(event: TelemetryBaseEvent): void {
  if (eventQueue.length >= TELEMETRY.MAX_QUEUE_SIZE) {
    eventQueue.shift();
  }
  eventQueue.push(event);
}

/** Flush the current queue by POSTing to the given endpoint. Clears queue on success. */
export async function flushEvents(endpoint: string): Promise<boolean> {
  if (eventQueue.length === 0) return true;

  const batch: TelemetryBatchRequest = {
    events: eventQueue as TelemetryEvent[],
    clientTimestamp: new Date().toISOString(),
    deviceId: 'dev_web',
    appVersion: '1.0.0',
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });

    if (res.ok) {
      clearQueue();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Process an inbound batch (server-side). Returns the response payload. */
export function processBatch(batch: TelemetryBatchRequest): TelemetryBatchResponse {
  const valid = batch.events.filter(validateEvent);
  const rejectedCount = batch.events.length - valid.length;
  const rejectedEventIds = batch.events
    .filter((e) => !validateEvent(e))
    .map((e) => e.eventId);

  return {
    accepted: valid.length,
    rejected: rejectedCount,
    rejectedEventIds,
    serverTimestamp: new Date().toISOString(),
  };
}

/**
 * Validate a single event:
 * - must have a type
 * - timestamp must be within the last hour
 */
export function validateEvent(event: TelemetryBaseEvent): boolean {
  if (!event.eventType) return false;
  const age = Date.now() - new Date(event.timestamp).getTime();
  return age <= TELEMETRY.MAX_EVENT_AGE_MS;
}

export function getQueueSize(): number {
  return eventQueue.length;
}

export function clearQueue(): void {
  eventQueue.length = 0;
}

/** Summarise a batch for logging/debugging. */
export function summarizeBatch(events: TelemetryBaseEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.eventType] = (counts[e.eventType] ?? 0) + 1;
  }
  return counts;
}

/** Filter events to a specific type with proper narrowing. */
export function filterEventsByType<T extends TelemetryBaseEvent>(
  events: TelemetryBaseEvent[],
  type: TelemetryEventType
): T[] {
  return events.filter((e): e is T => e.eventType === type);
}

/** Group events by profileId. */
export function groupEventsByProfile(
  events: TelemetryBaseEvent[]
): Record<string, TelemetryBaseEvent[]> {
  const groups: Record<string, TelemetryBaseEvent[]> = {};
  for (const e of events) {
    (groups[e.profileId] ??= []).push(e);
  }
  return groups;
}

/** Detect simple anomalies in a batch. Returns list of anomaly descriptions. */
export function detectAnomalies(events: TelemetryBaseEvent[]): string[] {
  const anomalies: string[] = [];

  // Future timestamp (> 5 minutes ahead)
  const futureEvents = events.filter(
    (e) => new Date(e.timestamp).getTime() > Date.now() + 5 * 60 * 1000
  );
  if (futureEvents.length > 0) {
    anomalies.push(`${futureEvents.length} event(s) have future timestamps`);
  }

  // Same eventId appearing more than once
  const ids = events.map((e) => e.eventId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    anomalies.push(`${dupes.length} duplicate eventId(s) detected`);
  }

  // Single profile sending > 80% of events in a batch (flood)
  const byProfile = groupEventsByProfile(events);
  for (const [profileId, profileEvents] of Object.entries(byProfile)) {
    if (profileEvents.length / events.length > 0.8 && events.length > 10) {
      anomalies.push(`Profile ${profileId} sent ${profileEvents.length}/${events.length} events — possible flood`);
    }
  }

  return anomalies;
}
