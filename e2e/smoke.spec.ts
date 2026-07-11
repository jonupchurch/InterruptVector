import { test, expect } from "@playwright/test";

// Placeholder smoke test -- stands in for Principle V's required
// full-vertical-slice e2e test until the build-tank -> submit-code ->
// battle -> replay flow exists.
test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Interrupt Vector/);
});
