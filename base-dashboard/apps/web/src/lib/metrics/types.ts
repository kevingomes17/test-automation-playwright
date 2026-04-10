import { z } from "zod"

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
})
export type Service = z.infer<typeof ServiceSchema>

export const ServiceStatusSchema = z.enum(["healthy", "degraded", "down"])
export type ServiceStatus = z.infer<typeof ServiceStatusSchema>

export const ServiceHealthSchema = ServiceSchema.extend({
  status: ServiceStatusSchema,
  uptimeSeconds: z.number(),
  sparkline: z.array(z.number()),
})
export type ServiceHealth = z.infer<typeof ServiceHealthSchema>

export const LatencyPointSchema = z.object({
  t: z.number(),
  p50: z.number(),
  p95: z.number(),
  p99: z.number(),
})
export type LatencyPoint = z.infer<typeof LatencyPointSchema>
export type LatencySeries = LatencyPoint[]

export const ErrorRatePointSchema = z.object({
  t: z.number(),
  errors: z.number(),
})
export type ErrorRatePoint = z.infer<typeof ErrorRatePointSchema>
export type ErrorRateSeries = ErrorRatePoint[]

export const ThroughputPointSchema = z.object({
  t: z.number(),
  rps: z.number(),
})
export type ThroughputPoint = z.infer<typeof ThroughputPointSchema>
export type ThroughputSeries = ThroughputPoint[]

export const SpanStatusSchema = z.enum(["ok", "error"])
export type SpanStatus = z.infer<typeof SpanStatusSchema>

export const SpanSchema = z.object({
  id: z.string(),
  parentId: z.string().optional(),
  serviceId: z.string(),
  serviceName: z.string(),
  operation: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  status: SpanStatusSchema,
})
export type Span = z.infer<typeof SpanSchema>

export const TraceSchema = z.object({
  id: z.string(),
  rootService: z.string(),
  rootOperation: z.string(),
  startedAt: z.number(),
  durationMs: z.number(),
  status: SpanStatusSchema,
  spans: z.array(SpanSchema),
})
export type Trace = z.infer<typeof TraceSchema>

export type ServiceSelector = string | "all"
