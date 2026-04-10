import {
  ActivityIcon,
  GaugeIcon,
  LayersIcon,
  SettingsIcon,
  WaypointsIcon,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: GaugeIcon, active: true },
  { id: "services", label: "Services", icon: LayersIcon, active: false },
  { id: "traces", label: "Traces", icon: WaypointsIcon, active: false },
  { id: "alerts", label: "Alerts", icon: ActivityIcon, active: false },
  { id: "settings", label: "Settings", icon: SettingsIcon, active: false },
]

export function AppSidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 flex-col border-r md:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-semibold">
          OB
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">observability</span>
          <span className="text-muted-foreground text-xs">microservices</span>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 px-2">
        <div className="text-muted-foreground px-2 pt-2 pb-1 text-[11px] uppercase tracking-wider">
          Platform
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="mt-auto px-4 py-3">
        <div className="text-muted-foreground text-[11px]">
          mock data — swap MetricsClient
        </div>
      </div>
    </aside>
  )
}
