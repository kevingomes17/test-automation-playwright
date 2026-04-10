import { useMemo, useState } from "react"
import { Tooltip } from "@base-ui/react/tooltip"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { metricsClient, useMetric, type Trace } from "@/lib/metrics"

const SERVICE_COLORS: Record<string, string> = {
  "api-gateway": "var(--chart-1)",
  auth: "var(--chart-2)",
  orders: "var(--chart-3)",
  payments: "var(--chart-4)",
  inventory: "var(--chart-5)",
  notifications: "var(--chart-2)",
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function TraceWaterfall() {
  const { data: traces, loading } = useMetric(
    () => metricsClient.listRecentTraces(8),
    [],
  )
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const selected: Trace | undefined = useMemo(() => {
    if (!traces?.length) return undefined
    return traces.find((t) => t.id === selectedId) ?? traces[0]
  }, [traces, selectedId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distributed traces</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || !traces || !selected ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
            <div className="flex flex-col gap-1">
              {traces.map((t) => {
                const isActive = t.id === selected.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      isActive
                        ? "bg-accent border-foreground/20"
                        : "hover:bg-accent/50 border-transparent",
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate font-mono">{t.id}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 text-[10px]",
                          t.status === "error"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {t.durationMs}ms
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      {t.rootService} · {t.rootOperation}
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      {formatTime(t.startedAt)}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="bg-card rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-mono">{selected.id}</span>
                <span className="text-muted-foreground">
                  total {selected.durationMs}ms · {selected.spans.length} spans
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {selected.spans.map((span) => {
                  const leftPct = (span.startMs / selected.durationMs) * 100
                  const widthPct = Math.max(
                    1.5,
                    (span.durationMs / selected.durationMs) * 100,
                  )
                  const color =
                    SERVICE_COLORS[span.serviceId] ?? "var(--chart-1)"
                  return (
                    <div
                      key={span.id}
                      className="grid grid-cols-[180px_1fr] items-center gap-3"
                    >
                      <div className="truncate text-xs">
                        <span className="font-medium">{span.serviceName}</span>
                        <span className="text-muted-foreground">
                          {" · "}
                          {span.operation}
                        </span>
                      </div>
                      <div className="bg-muted/40 relative h-5 rounded">
                        <Tooltip.Root>
                          <Tooltip.Trigger
                            render={
                              <div
                                className={cn(
                                  "absolute top-0 h-full rounded",
                                  span.status === "error" &&
                                    "ring-destructive ring-2",
                                )}
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  backgroundColor: color,
                                }}
                              />
                            }
                          />
                          <Tooltip.Portal>
                            <Tooltip.Positioner sideOffset={6} className="z-50">
                              <Tooltip.Popup className="bg-popover text-popover-foreground rounded-md border px-2.5 py-1.5 text-xs shadow-md">
                                <div className="font-medium">
                                  {span.serviceName} · {span.operation}
                                </div>
                                <div className="text-muted-foreground">
                                  start +{span.startMs}ms · duration{" "}
                                  {span.durationMs}ms · {span.status}
                                </div>
                              </Tooltip.Popup>
                            </Tooltip.Positioner>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
