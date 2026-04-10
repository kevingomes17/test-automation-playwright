import { test, expect, type Page, type Locator } from "@playwright/test"

function cardByTitle(page: Page, title: string): Locator {
  return page
    .locator("main")
    .getByText(title, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
}

async function pickService(card: Locator, service: string): Promise<void> {
  // Open the Select trigger inside this card. The trigger has role=combobox.
  await card.getByRole("combobox").click()
  // The popup is rendered in a portal, so query at the page level.
  const page = card.page()
  await page.getByRole("option", { name: service, exact: true }).click()
}

test.describe("Chart service selectors", () => {
  test("latency chart filters by service", async ({ page }) => {
    await page.goto("/")
    const latency = cardByTitle(page, "Latency (p50 / p95 / p99)")
    await expect(latency).toBeVisible()

    // Default value renders the label "All services" via the Select component.
    await expect(latency.getByRole("combobox")).toContainText("All services")

    await pickService(latency, "orders")
    await expect(latency.getByRole("combobox")).toContainText("orders")
  })

  test("error rate chart filters by service", async ({ page }) => {
    await page.goto("/")
    const errors = cardByTitle(page, "Errors (5xx)")
    await expect(errors).toBeVisible()

    await expect(errors.getByRole("combobox")).toContainText("All services")

    await pickService(errors, "payments")
    await expect(errors.getByRole("combobox")).toContainText("payments")
  })
})
