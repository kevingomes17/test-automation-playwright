type TooltipEntry = {
  dataKey?: string | number
  name?: string | number
  value?: string | number
  color?: string
  stroke?: string
}

type Props = {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  unit?: string
}

export function ChartTooltip({ active, payload, label, unit = "" }: Props) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover text-popover-foreground rounded-md border px-2.5 py-1.5 text-xs shadow-md">
      {label != null && (
        <div className="text-muted-foreground mb-1">{label}</div>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div
            key={String(entry.dataKey ?? entry.name)}
            className="flex items-center gap-2"
          >
            <span
              className="size-2 rounded-sm"
              style={{
                backgroundColor: String(
                  entry.color ?? entry.stroke ?? "currentColor",
                ),
              }}
            />
            <span className="text-muted-foreground">
              {String(entry.name ?? entry.dataKey)}
            </span>
            <span className="ml-auto font-medium">
              {entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
