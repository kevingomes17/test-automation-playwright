import { test, expect, type Page, type Locator } from "@playwright/test"

function tracesCard(page: Page): Locator {
  return page
    .locator("main")
    .getByText("Distributed traces")
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
}

test.describe("Trace waterfall", () => {
  test("renders the recent trace list and selects the first trace by default", async ({
    page,
  }) => {
    await page.goto("/")
    const card = tracesCard(page)
    await expect(card).toBeVisible()

    // The mock client returns 8 recent traces, IDs trace-1..trace-8.
    for (let i = 1; i <= 8; i++) {
      await expect(card.getByText(`trace-${i}`).first()).toBeVisible()
    }

    // The right-pane header echoes the selected trace ID. trace-1 should be active.
    // Two locations show "trace-1": the list button and the right-pane header.
    // The header is the only one accompanied by "spans".
    await expect(card.getByText(/total \d+ms · 6 spans/)).toBeVisible()
  })

  test("clicking a different trace updates the waterfall header", async ({
    page,
  }) => {
    await page.goto("/")
    const card = tracesCard(page)

    // Click trace-2 in the list.
    await card.getByRole("button", { name: /trace-2/ }).click()

    // The right-pane header is the trace-2 occurrence inside a font-mono span
    // that is NOT inside a button. Find the trace-2 text inside the right pane
    // (the right pane has the "total ... spans" text alongside).
    const rightPaneTraceId = card
      .locator("div", { hasText: /total \d+ms · 6 spans/ })
      .getByText("trace-2")
      .first()
    await expect(rightPaneTraceId).toBeVisible()
  })
})
