import { useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { Separator } from "@base-ui/react/separator"
import { Button } from "@workspace/ui/components/button"
import { Select } from "@workspace/ui/components/select"
import { useTheme } from "@/components/theme-provider"

const ENV_OPTIONS = [
  { value: "production", label: "production" },
  { value: "staging", label: "staging" },
  { value: "dev", label: "dev" },
]

export function AppHeader() {
  const { theme, setTheme } = useTheme()
  const [env, setEnv] = useState("production")
  const isDark = theme === "dark"

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Dashboard</span>
        <Separator orientation="vertical" className="bg-border h-4 w-px" />
        <span className="font-medium">Overview</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Select
          value={env}
          onChange={setEnv}
          options={ENV_OPTIONS}
          className="w-32"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </Button>
      </div>
    </header>
  )
}
