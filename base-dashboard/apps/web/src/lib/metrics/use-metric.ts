import { useEffect, useState } from "react"

export function useMetric<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
): { data: T | undefined; loading: boolean } {
  const [data, setData] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fn().then((result) => {
      if (cancelled) return
      setData(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading }
}
