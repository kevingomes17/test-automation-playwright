import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Select } from "@workspace/ui/components/select"
import { ChartTooltip } from "@/components/widgets/chart-tooltip"
import { metricsClient, useMetric, type ServiceSelector } from "@/lib/metrics"

const RANGE_MIN = 60

const SERIES = [
  { key: "p50", color: "var(--chart-1)" },
  { key: "p95", color: "var(--chart-2)" },
  { key: "p99", color: "var(--chart-3)" },
] as const

export function LatencyChart() {
  const [service, setService] = useState<ServiceSelector>("all")
  const { data: services } = useMetric(() => metricsClient.listServices(), [])
  const { data, loading } = useMetric(
    () => metricsClient.getLatency(service, RANGE_MIN),
    [service],
  )

  const chartData = (data ?? []).map((p) => ({
    ...p,
    label: new Date(p.t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  const options = useMemo(
    () => [
      { value: "all", label: "All services" },
      ...(services ?? []).map((s) => ({ value: s.id, label: s.name })),
    ],
    [services],
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Latency (p50 / p95 / p99)</CardTitle>
        <Select
          value={service}
          onChange={(v) => setService(v as ServiceSelector)}
          options={options}
          className="w-44"
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground h-56 text-sm">Loading…</div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={32}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v: number) => `${v}ms`}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  content={<ChartTooltip unit="ms" />}
                />
                {SERIES.map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    type="monotone"
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
