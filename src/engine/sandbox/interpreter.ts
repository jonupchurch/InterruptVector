import { newQuickJSWASMModule, type QuickJSContext, type QuickJSHandle } from "quickjs-emscripten";
import { DEFAULT_MEMORY_LIMIT_BYTES } from "./memory-guard";
import { createStepBudgetGuard, DEFAULT_STEP_BUDGET, type StepBudgetGuard } from "./step-budget";

/**
 * One sandboxed interpreter per tank per match, created once and
 * reused for every tick (Pilot Code wiki: "Persistent state across
 * ticks") -- ADR 0001. Server-side, in-process, no network/filesystem
 * access unless deliberately exposed as a host function (Principle
 * II).
 *
 * Uses a fully isolated WASM module per sandbox (`newQuickJSWASMModule`)
 * rather than the shared singleton (`getQuickJS`) -- Principle II
 * requires errors in one runtime to never contaminate another, and a
 * shared module is exactly the kind of shared state that could let a
 * crashed/interrupted sandbox affect its opponent's or a later
 * match's sandbox in the same server process.
 */
export interface Sandbox {
  context: QuickJSContext;
  stepBudget: StepBudgetGuard;
  /** Throws on syntax error in sourceCode -- callers should have already syntax-checked via src/lib/syntax-check.ts. */
  callPilotCode: (apiHandle: QuickJSHandle) => PilotCallResult;
  dispose: () => void;
}

export type PilotCallResult =
  | { kind: "ok" }
  | { kind: "error"; message: string }
  | { kind: "runaway" };

export async function createSandbox(
  sourceCode: string,
  options?: { stepBudget?: number; memoryLimitBytes?: number },
): Promise<Sandbox> {
  const quickjsModule = await newQuickJSWASMModule();
  const context = quickjsModule.newContext();
  const stepBudget = createStepBudgetGuard(options?.stepBudget ?? DEFAULT_STEP_BUDGET);

  context.runtime.setMemoryLimit(options?.memoryLimitBytes ?? DEFAULT_MEMORY_LIMIT_BYTES);
  context.runtime.setInterruptHandler(stepBudget.handler);

  const defineResult = context.evalCode(sourceCode);
  context.unwrapResult(defineResult).dispose(); // discard the top-level eval's own result value

  const pilotCodeFn = context.getProp(context.global, "pilotCode");
  if (context.typeof(pilotCodeFn) !== "function") {
    pilotCodeFn.dispose();
    context.dispose();
    throw new Error("pilotCode(api) is not defined -- pilot code must declare a top-level `function pilotCode(api) { ... }`.");
  }

  function callPilotCode(apiHandle: QuickJSHandle): PilotCallResult {
    stepBudget.reset();
    const result = context.callFunction(pilotCodeFn, context.undefined, apiHandle);
    const tripped = stepBudget.wasTripped();

    // Always dispose whichever branch of the result is present -- a
    // runaway-interrupted call still returns a (partial/error) result
    // handle, and leaving it undisposed left dangling QuickJS GC
    // objects that crashed the WASM module on a later `dispose()`.
    if (result.error) {
      const message = context.dump(result.error);
      result.error.dispose();
      if (tripped) return { kind: "runaway" };
      return { kind: "error", message: typeof message === "string" ? message : JSON.stringify(message) };
    }
    result.value.dispose();
    if (tripped) return { kind: "runaway" };
    return { kind: "ok" };
  }

  return {
    context,
    stepBudget,
    callPilotCode,
    dispose: () => {
      pilotCodeFn.dispose();
      context.dispose();
    },
  };
}

/**
 * Save-time validation that a program actually defines
 * `function pilotCode(api) { ... }` -- `src/lib/syntax-check.ts`'s
 * plain syntax check can't catch this (it wraps source in an implicit
 * function, which parses fine even for top-level code that isn't
 * actually shaped like a pilot program). This spins up a real
 * (disposable, never-called) sandbox, which is the one place it's
 * safe to find out, since createSandbox never executes anything
 * outside the WASM realm.
 */
export async function verifyPilotCodeIsDefined(sourceCode: string): Promise<{ valid: boolean; message?: string }> {
  try {
    const sandbox = await createSandbox(sourceCode);
    sandbox.dispose();
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err instanceof Error ? err.message : "Pilot code failed to load." };
  }
}
