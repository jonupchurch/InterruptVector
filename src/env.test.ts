import { describe, expect, it, vi } from "vitest";

describe("env", () => {
  it("parses a valid DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://user:pass@localhost:5432/db");
    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgres://user:pass@localhost:5432/db");
  });

  it("throws when DATABASE_URL is missing or invalid", async () => {
    vi.resetModules();
    vi.stubEnv("DATABASE_URL", "not-a-url");
    await expect(import("./env")).rejects.toBeDefined();
  });
});
