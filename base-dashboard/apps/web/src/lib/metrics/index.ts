import type { MetricsClient } from "./client"
import { MockMetricsClient } from "./mock-client"

export const metricsClient: MetricsClient = new MockMetricsClient()

export type { MetricsClient } from "./client"
export * from "./types"
export { useMetric } from "./use-metric"
