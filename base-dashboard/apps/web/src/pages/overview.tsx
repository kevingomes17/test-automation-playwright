import { ErrorRateChart } from "@/components/widgets/error-rate-chart"
import { LatencyChart } from "@/components/widgets/latency-chart"
import { ServiceHealthGrid } from "@/components/widgets/service-health-grid"
import { ThroughputTiles } from "@/components/widgets/throughput-tiles"
import { TraceWaterfall } from "@/components/widgets/trace-waterfall"

export function OverviewPage() {
  return (
    <main className="flex flex-col gap-4 p-4">
      <ThroughputTiles />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LatencyChart />
        </div>
        <ErrorRateChart />
      </div>
      <ServiceHealthGrid />
      <TraceWaterfall />
    </main>
  )
}
