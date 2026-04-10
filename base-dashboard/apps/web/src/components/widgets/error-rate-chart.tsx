import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
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

export function ErrorRateChart() {
  const [service, setService] = useState<ServiceSelector>("all")
  const { data: services } = useMetric(() => metricsClient.listServices(), [])
  const { data, loading } = useMetric(
    () => metricsClient.getErrorRate(service, RANGE_MIN),
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
        <CardTitle>Errors (5xx)</CardTitle>
        <Select
          value={service}
          onChange={(v) => setService(v as ServiceSelector)}
          options={options}
          className="w-36"
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground h-56 text-sm">Loading…</div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ left: 4, right: 8, top: 8 }}
              >
                <defs>
                  <linearGradient id="errFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
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
                  width={28}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  content={<ChartTooltip />}
                />
                <Area
                  dataKey="errors"
                  type="monotone"
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  fill="url(#errFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
