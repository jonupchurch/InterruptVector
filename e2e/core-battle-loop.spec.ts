import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Principle V's required full-vertical-slice e2e test: build a tank,
// save pilot code, fight a boss, view the result and a replay. Also
// carries the WCAG 2.1 AA accessibility pass (Principle III) across
// all six MVP pages, since exercising every page's real, populated
// state here is a natural place to run it too.

async function expectNoSeriousA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (serious.length > 0) {
    console.log(JSON.stringify(serious, null, 2));
  }
  expect(serious, `${serious.length} serious/critical a11y violation(s) on ${page.url()}`).toEqual([]);
}

test.describe("Core Battle Loop", () => {
  test("home page loads and is accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Interrupt Vector/);
    await expect(page.getByRole("heading", { name: "Interrupt Vector" })).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });

  test("full loop: build a tank, save pilot code, fight, view replay", async ({ page }) => {
    const suffix = Date.now();

    // --- The Bay: build a tank ---
    await page.goto("/builder");
    await expectNoSeriousA11yViolations(page);
    await page.getByRole("button", { name: /New Build/i }).click();
    await page.getByPlaceholder("RAZORBACK").fill(`E2E Tank ${suffix}`);
    await page.getByRole("button", { name: /Save Build/i }).click();
    await page.waitForSelector("text=Saved.");

    // --- The Socket: save pilot code ---
    await page.goto("/code");
    await expectNoSeriousA11yViolations(page);
    await page.getByRole("button", { name: /New Program/i }).click();
    await page.getByPlaceholder("Program name").fill(`E2E Program ${suffix}`);
    await page.waitForSelector(".monaco-editor");
    await page.getByRole("button", { name: /Save Program/i }).click();
    await page.waitForSelector("text=Saved.");

    // --- Battles: fight ---
    await page.goto("/battles");
    await expectNoSeriousA11yViolations(page);
    await page.locator("select").nth(0).selectOption({ label: `E2E Tank ${suffix}` });
    await page.locator("select").nth(1).selectOption({ label: `E2E Program ${suffix}` });
    await page.getByRole("button", { name: /Engage/i }).click();
    await page.waitForFunction(
      () => {
        const t = document.body.innerText;
        return t.includes("VICTORY") || t.includes("DEFEAT") || t.includes("SIMULATION FAILED");
      },
      undefined,
      { timeout: 60000 },
    );
    const resultText = await page.locator("body").innerText();
    expect(resultText).not.toContain("SIMULATION FAILED");

    // --- Replay: scrub ---
    await page.getByRole("link", { name: /View Replay/i }).click();
    await page.waitForSelector("text=Replay — Battle");
    await expectNoSeriousA11yViolations(page);
    const slider = page.locator('input[type="range"]');
    await slider.fill("3");
    await expect(page.locator("text=/Tick 4/")).toBeVisible();

    // --- Battle history shows it ---
    await page.goto("/battles");
    await expect(page.getByText(/Battle #\d+/).first()).toBeVisible();

    // --- Profile reflects it ---
    await page.goto("/profile");
    await expectNoSeriousA11yViolations(page);
    await expect(page.getByText(/Total Battles/)).toBeVisible();
  });
});
