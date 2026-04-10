import { Line, LineChart, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { metricsClient, useMetric, type ServiceStatus } from "@/lib/metrics"

const STATUS_VARIANT: Record<
  ServiceStatus,
  { label: string; className: string }
> = {
  healthy: {
    label: "healthy",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  degraded: {
    label: "degraded",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  down: {
    label: "down",
    className: "bg-destructive/15 text-destructive",
  },
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export function ServiceHealthGrid() {
  const { data, loading } = useMetric(() => metricsClient.getServiceHealth(), [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !data ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((svc) => {
              const variant = STATUS_VARIANT[svc.status]
              const sparkData = svc.sparkline.map((v, i) => ({ i, v }))
              return (
                <div
                  key={svc.id}
                  className="bg-card flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {svc.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {svc.version} · up {formatUptime(svc.uptimeSeconds)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-medium",
                        variant.className,
                      )}
                    >
                      {variant.label}
                    </span>
                  </div>
                  <div className="h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparkData}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={
                            svc.status === "down"
                              ? "var(--destructive)"
                              : "var(--chart-2)"
                          }
                          strokeWidth={1.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
