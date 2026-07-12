import { test, expect } from "@playwright/test";

// Principle III: Builder and Code are desktop-first by design (a
// programming surface is a poor fit for touch), but Home, Profile,
// Battles, and Replay must work on mobile. Checks for real overflow
// (a horizontal scrollbar forced onto the body) and that primary
// actions stay reachable at a small viewport, not just "doesn't
// visually break" by eye. Viewport-only (not the full device preset,
// which pulls in WebKit -- this project only installs Chromium).
test.use({ viewport: { width: 390, height: 844 } });

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow, `${page.url()} has horizontal overflow at mobile width`).toBe(false);
}

test.describe("Mobile usability (Principle III)", () => {
  test("Home works on a mobile viewport", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Interrupt Vector" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter the Bay" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Profile works on a mobile viewport", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("Pilot Profile")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("Battles works on a mobile viewport", async ({ page }) => {
    await page.goto("/battles");
    await expect(page.getByText("Battles").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
