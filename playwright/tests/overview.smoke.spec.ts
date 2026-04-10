import { test, expect } from "@playwright/test"

const SERVICES = [
  "api-gateway",
  "auth",
  "orders",
  "payments",
  "inventory",
  "notifications",
] as const

test.describe("Overview page smoke", () => {
  test("renders all five widgets", async ({ page }) => {
    await page.goto("/")
    const main = page.locator("main")

    // Throughput tiles
    await expect(main.getByText("Total RPS")).toBeVisible()
    await expect(main.getByText("Avg p95 latency")).toBeVisible()
    await expect(main.getByText("Error rate")).toBeVisible()

    // Charts
    await expect(main.getByText("Latency (p50 / p95 / p99)")).toBeVisible()
    await expect(main.getByText("Errors (5xx)")).toBeVisible()

    // Service health grid + trace waterfall
    await expect(main.getByText("Services", { exact: true })).toBeVisible()
    await expect(main.getByText("Distributed traces")).toBeVisible()
  })

  test("lists all six mock services in the health grid", async ({ page }) => {
    await page.goto("/")
    const main = page.locator("main")

    const card = main
      .getByText("Services", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    await expect(card).toBeVisible()

    for (const name of SERVICES) {
      await expect(card.getByText(name, { exact: true }).first()).toBeVisible()
    }
  })

  test("page loads without console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/")
    await expect(page.locator("main").getByText("Distributed traces")).toBeVisible()

    expect(errors, errors.join("\n")).toEqual([])
  })
})
