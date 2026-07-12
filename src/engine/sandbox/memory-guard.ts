/**
 * WASM memory ceiling (spec Edge Cases, Runaway protection). Enforced
 * by quickjs-emscripten's own allocator via
 * `context.runtime.setMemoryLimit()` -- exceeding it fails the current
 * evalCode/callFunction the same way a thrown exception would. Exact
 * limit is an implementation tuning detail, not a design commitment.
 */
export const DEFAULT_MEMORY_LIMIT_BYTES = 32 * 1024 * 1024; // 32MB

/** Heuristic: does this error look like a memory-limit failure rather than an ordinary pilot-code exception? */
export function looksLikeMemoryLimitError(message: string): boolean {
  return /memory|allocation|out of memory|malloc/i.test(message);
}
