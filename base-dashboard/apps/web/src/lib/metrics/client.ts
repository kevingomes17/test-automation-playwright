import type {
  ErrorRateSeries,
  LatencySeries,
  Service,
  ServiceHealth,
  ServiceSelector,
  ThroughputSeries,
  Trace,
} from "./types"

export interface MetricsClient {
  listServices(): Promise<Service[]>
  getServiceHealth(): Promise<ServiceHealth[]>
  getLatency(service: ServiceSelector, rangeMinutes: number): Promise<LatencySeries>
  getErrorRate(service: ServiceSelector, rangeMinutes: number): Promise<ErrorRateSeries>
  getThroughput(service: ServiceSelector, rangeMinutes: number): Promise<ThroughputSeries>
  listRecentTraces(limit: number): Promise<Trace[]>
  getTrace(id: string): Promise<Trace | undefined>
}
