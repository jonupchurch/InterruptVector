import { after } from "next/server";

/**
 * Wraps Next.js's `after()` -- the documented way to keep a function
 * alive to finish background work once a response is sent, rather
 * than a bare fire-and-forget promise a platform isn't obligated to
 * let finish. Falls back to a plain (still async, still
 * non-blocking) invocation when called outside a real request scope,
 * which `after()` itself doesn't support -- specifically so route
 * handlers can be exercised directly in integration tests without a
 * live Next.js server, which `after()` alone can't do.
 */
export function scheduleAfterResponse(task: () => Promise<void>): void {
  try {
    after(task);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("outside a request scope")) {
      void task();
      return;
    }
    throw err;
  }
}
