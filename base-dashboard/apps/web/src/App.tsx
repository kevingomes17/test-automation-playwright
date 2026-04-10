import { Tooltip } from "@base-ui/react/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { OverviewPage } from "@/pages/overview"

export function App() {
  return (
    <Tooltip.Provider>
      <div className="bg-background flex min-h-svh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <OverviewPage />
        </div>
      </div>
    </Tooltip.Provider>
  )
}
