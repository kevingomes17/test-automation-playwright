import type { MetricsClient } from "./client"
import type {
  ErrorRateSeries,
  LatencySeries,
  Service,
  ServiceHealth,
  ServiceSelector,
  Span,
  ThroughputSeries,
  Trace,
} from "./types"

// Deterministic seeded RNG so charts don't jitter across renders.
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const SERVICES: Service[] = [
  { id: "api-gateway", name: "api-gateway", version: "v2.14.3" },
  { id: "auth", name: "auth", version: "v1.8.0" },
  { id: "orders", name: "orders", version: "v3.2.1" },
  { id: "payments", name: "payments", version: "v4.0.7" },
  { id: "inventory", name: "inventory", version: "v1.12.5" },
  { id: "notifications", name: "notifications", version: "v0.9.4" },
]

const STATUS_BY_SERVICE: Record<string, ServiceHealth["status"]> = {
  "api-gateway": "healthy",
  auth: "healthy",
  orders: "degraded",
  payments: "healthy",
  inventory: "healthy",
  notifications: "down",
}

// Anchor "now" so deterministic data lines up with a stable timeline.
const NOW = 1_733_000_000_000

function buildSeries(
  service: ServiceSelector,
  rangeMinutes: number,
  generator: (rand: () => number, i: number) => Record<string, number>,
): Array<{ t: number } & Record<string, number>> {
  const seed = hashString(`${service}:${rangeMinutes}`)
  const rand = mulberry32(seed)
  const points = Math.max(20, rangeMinutes)
  const stepMs = (rangeMinutes * 60 * 1000) / points
  const start = NOW - rangeMinutes * 60 * 1000
  return Array.from({ length: points }, (_, i) => ({
    t: start + i * stepMs,
    ...generator(rand, i),
  }))
}

function genLatency(rand: () => number, i: number) {
  const base = 40 + Math.sin(i / 6) * 8 + rand() * 10
  const p50 = Math.round(base)
  const p95 = Math.round(base * 2.2 + rand() * 20)
  const p99 = Math.round(base * 3.6 + rand() * 30)
  return { p50, p95, p99 }
}

function genErrors(rand: () => number, i: number) {
  const spike = i % 17 === 0 ? 8 + rand() * 6 : 0
  return { errors: Math.round(rand() * 3 + spike) }
}

function genThroughput(rand: () => number, i: number) {
  return { rps: Math.round(800 + Math.sin(i / 5) * 120 + rand() * 80) }
}

function buildTrace(id: string, startedAt: number): Trace {
  const rand = mulberry32(hashString(id))
  const mk = (
    spanId: string,
    parentId: string | undefined,
    serviceId: string,
    operation: string,
    startMs: number,
    durationMs: number,
    status: Span["status"] = "ok",
  ): Span => ({
    id: spanId,
    parentId,
    serviceId,
    serviceName: serviceId,
    operation,
    startMs,
    durationMs,
    status,
  })

  const gw = mk("s1", undefined, "api-gateway", "POST /checkout", 0, 420)
  const auth = mk("s2", "s1", "auth", "verifyToken", 4, 22)
  const orders = mk("s3", "s1", "orders", "createOrder", 30, 360)
  const inv = mk("s4", "s3", "inventory", "reserveItems", 40, 95)
  const pay = mk(
    "s5",
    "s3",
    "payments",
    "charge",
    140,
    180,
    rand() < 0.2 ? "error" : "ok",
  )
  const notif = mk("s6", "s3", "notifications", "sendReceipt", 330, 55)

  const spans = [gw, auth, orders, inv, pay, notif]
  const status = spans.some((s) => s.status === "error") ? "error" : "ok"
  return {
    id,
    rootService: gw.serviceName,
    rootOperation: gw.operation,
    startedAt,
    durationMs: gw.durationMs,
    status,
    spans,
  }
}

export class MockMetricsClient implements MetricsClient {
  async listServices() {
    return SERVICES
  }

  async getServiceHealth(): Promise<ServiceHealth[]> {
    return SERVICES.map((s) => {
      const rand = mulberry32(hashString(`spark:${s.id}`))
      const sparkline = Array.from({ length: 24 }, () => Math.round(rand() * 100))
      return {
        ...s,
        status: STATUS_BY_SERVICE[s.id] ?? "healthy",
        uptimeSeconds: 60 * 60 * 24 * (3 + (hashString(s.id) % 30)),
        sparkline,
      }
    })
  }

  async getLatency(service: ServiceSelector, rangeMinutes: number): Promise<LatencySeries> {
    return buildSeries(service, rangeMinutes, genLatency) as LatencySeries
  }

  async getErrorRate(service: ServiceSelector, rangeMinutes: number): Promise<ErrorRateSeries> {
    return buildSeries(service, rangeMinutes, genErrors) as ErrorRateSeries
  }

  async getThroughput(service: ServiceSelector, rangeMinutes: number): Promise<ThroughputSeries> {
    return buildSeries(service, rangeMinutes, genThroughput) as ThroughputSeries
  }

  async listRecentTraces(limit: number): Promise<Trace[]> {
    return Array.from({ length: limit }, (_, i) =>
      buildTrace(`trace-${i + 1}`, NOW - i * 47_000),
    )
  }

  async getTrace(id: string): Promise<Trace | undefined> {
    return buildTrace(id, NOW)
  }
}
