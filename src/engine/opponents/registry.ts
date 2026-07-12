import { PILOT_CODE as RANK_1_BOSS } from "./rank-1-boss";
import { PILOT_CODE as RANK_1_CHALLENGER_1 } from "./rank-1-challenger-1";
import { PILOT_CODE as RANK_1_CHALLENGER_2 } from "./rank-1-challenger-2";
import { PILOT_CODE as RANK_1_CHALLENGER_3 } from "./rank-1-challenger-3";

/**
 * Maps each opponent's `behaviorModule` identifier (stored in the
 * `opponents` table) to its project-authored pilot code. One entry
 * per boss/challenger -- ranks 2-10 are added here as they're
 * authored (plan.md Complexity Tracking: deliberately sequenced after
 * the rank-1 vertical slice, not required for it).
 */
const REGISTRY: Record<string, string> = {
  "rank-1-boss": RANK_1_BOSS,
  "rank-1-challenger-1": RANK_1_CHALLENGER_1,
  "rank-1-challenger-2": RANK_1_CHALLENGER_2,
  "rank-1-challenger-3": RANK_1_CHALLENGER_3,
};

export function loadOpponentPilotCode(behaviorModule: string): string {
  const source = REGISTRY[behaviorModule];
  if (!source) throw new Error(`No pilot code registered for behaviorModule "${behaviorModule}"`);
  return source;
}
