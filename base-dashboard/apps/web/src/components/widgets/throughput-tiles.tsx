import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { metricsClient, useMetric } from "@/lib/metrics"

const RANGE_MIN = 60

type Tile = {
  title: string
  value: string
  delta: number
  invertColor?: boolean
  series: number[]
  color: string
}

function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function ThroughputTiles() {
  const { data: throughput } = useMetric(
    () => metricsClient.getThroughput("all", RANGE_MIN),
    [],
  )
  const { data: latency } = useMetric(
    () => metricsClient.getLatency("all", RANGE_MIN),
    [],
  )
  const { data: errors } = useMetric(
    () => metricsClient.getErrorRate("all", RANGE_MIN),
    [],
  )

  if (!throughput || !latency || !errors) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading…</CardTitle>
            </CardHeader>
            <CardContent className="h-20" />
          </Card>
        ))}
      </div>
    )
  }

  const half = Math.floor(throughput.length / 2)
  const rps = throughput.map((p) => p.rps)
  const rpsCurrent = rps[rps.length - 1] ?? 0
  const rpsDelta =
    ((avg(rps.slice(half)) - avg(rps.slice(0, half))) /
      Math.max(1, avg(rps.slice(0, half)))) *
    100

  const p95 = latency.map((p) => p.p95)
  const p95Current = p95[p95.length - 1] ?? 0
  const p95Delta =
    ((avg(p95.slice(half)) - avg(p95.slice(0, half))) /
      Math.max(1, avg(p95.slice(0, half)))) *
    100

  const errs = errors.map((p) => p.errors)
  const totalErr = errs.reduce((a, b) => a + b, 0)
  const totalReq = rps.reduce((a, b) => a + b, 0)
  const errRate = totalReq === 0 ? 0 : (totalErr / totalReq) * 100
  const errDelta =
    ((avg(errs.slice(half)) - avg(errs.slice(0, half))) /
      Math.max(1, avg(errs.slice(0, half)))) *
    100

  const tiles: Tile[] = [
    {
      title: "Total RPS",
      value: rpsCurrent.toLocaleString(),
      delta: rpsDelta,
      series: rps,
      color: "var(--chart-2)",
    },
    {
      title: "Avg p95 latency",
      value: `${p95Current}ms`,
      delta: p95Delta,
      invertColor: true,
      series: p95,
      color: "var(--chart-3)",
    },
    {
      title: "Error rate",
      value: `${errRate.toFixed(2)}%`,
      delta: errDelta,
      invertColor: true,
      series: errs,
      color: "var(--destructive)",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {tiles.map((tile) => {
        const goodDirection = tile.invertColor ? tile.delta < 0 : tile.delta >= 0
        const isFlat = Math.abs(tile.delta) < 0.5
        return (
          <Card key={tile.title}>
            <CardHeader>
              <CardDescription>{tile.title}</CardDescription>
              <CardTitle className="text-2xl">{tile.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-3">
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isFlat
                    ? "text-muted-foreground"
                    : goodDirection
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive",
                )}
              >
                {!isFlat &&
                  (tile.delta >= 0 ? (
                    <ArrowUpIcon className="size-3" />
                  ) : (
                    <ArrowDownIcon className="size-3" />
                  ))}
                {tile.delta >= 0 ? "+" : ""}
                {tile.delta.toFixed(1)}%
              </div>
              <div className="h-10 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tile.series.map((v, i) => ({ i, v }))}>
                    <defs>
                      <linearGradient
                        id={`spark-${tile.title}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={tile.color}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor={tile.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={tile.color}
                      strokeWidth={1.5}
                      fill={`url(#spark-${tile.title})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
