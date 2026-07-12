import { PILOT_CODE as RANK_1_BOSS } from "./rank-1-boss";
import { PILOT_CODE as RANK_1_CHALLENGER_1 } from "./rank-1-challenger-1";
import { PILOT_CODE as RANK_1_CHALLENGER_2 } from "./rank-1-challenger-2";
import { PILOT_CODE as RANK_1_CHALLENGER_3 } from "./rank-1-challenger-3";
import { PILOT_CODE as RANK_2_BOSS } from "./rank-2-boss";
import { PILOT_CODE as RANK_2_CHALLENGER_1 } from "./rank-2-challenger-1";
import { PILOT_CODE as RANK_2_CHALLENGER_2 } from "./rank-2-challenger-2";
import { PILOT_CODE as RANK_2_CHALLENGER_3 } from "./rank-2-challenger-3";
import { PILOT_CODE as RANK_3_BOSS } from "./rank-3-boss";
import { PILOT_CODE as RANK_3_CHALLENGER_1 } from "./rank-3-challenger-1";
import { PILOT_CODE as RANK_3_CHALLENGER_2 } from "./rank-3-challenger-2";
import { PILOT_CODE as RANK_3_CHALLENGER_3 } from "./rank-3-challenger-3";
import { PILOT_CODE as RANK_4_BOSS } from "./rank-4-boss";
import { PILOT_CODE as RANK_4_CHALLENGER_1 } from "./rank-4-challenger-1";
import { PILOT_CODE as RANK_4_CHALLENGER_2 } from "./rank-4-challenger-2";
import { PILOT_CODE as RANK_4_CHALLENGER_3 } from "./rank-4-challenger-3";
import { PILOT_CODE as RANK_5_BOSS } from "./rank-5-boss";
import { PILOT_CODE as RANK_5_CHALLENGER_1 } from "./rank-5-challenger-1";
import { PILOT_CODE as RANK_5_CHALLENGER_2 } from "./rank-5-challenger-2";
import { PILOT_CODE as RANK_5_CHALLENGER_3 } from "./rank-5-challenger-3";
import { PILOT_CODE as RANK_6_BOSS } from "./rank-6-boss";
import { PILOT_CODE as RANK_6_CHALLENGER_1 } from "./rank-6-challenger-1";
import { PILOT_CODE as RANK_6_CHALLENGER_2 } from "./rank-6-challenger-2";
import { PILOT_CODE as RANK_6_CHALLENGER_3 } from "./rank-6-challenger-3";
import { PILOT_CODE as RANK_7_BOSS } from "./rank-7-boss";
import { PILOT_CODE as RANK_7_CHALLENGER_1 } from "./rank-7-challenger-1";
import { PILOT_CODE as RANK_7_CHALLENGER_2 } from "./rank-7-challenger-2";
import { PILOT_CODE as RANK_7_CHALLENGER_3 } from "./rank-7-challenger-3";
import { PILOT_CODE as RANK_8_BOSS } from "./rank-8-boss";
import { PILOT_CODE as RANK_8_CHALLENGER_1 } from "./rank-8-challenger-1";
import { PILOT_CODE as RANK_8_CHALLENGER_2 } from "./rank-8-challenger-2";
import { PILOT_CODE as RANK_8_CHALLENGER_3 } from "./rank-8-challenger-3";
import { PILOT_CODE as RANK_9_BOSS } from "./rank-9-boss";
import { PILOT_CODE as RANK_9_CHALLENGER_1 } from "./rank-9-challenger-1";
import { PILOT_CODE as RANK_9_CHALLENGER_2 } from "./rank-9-challenger-2";
import { PILOT_CODE as RANK_9_CHALLENGER_3 } from "./rank-9-challenger-3";
import { PILOT_CODE as RANK_10_BOSS } from "./rank-10-boss";
import { PILOT_CODE as RANK_10_CHALLENGER_1 } from "./rank-10-challenger-1";
import { PILOT_CODE as RANK_10_CHALLENGER_2 } from "./rank-10-challenger-2";
import { PILOT_CODE as RANK_10_CHALLENGER_3 } from "./rank-10-challenger-3";

/**
 * Maps each opponent's `behaviorModule` identifier (stored in the
 * `opponents` table) to its project-authored pilot code. All ten
 * ranks' worth (10 bosses + 30 challengers = 40 total, spec FR-025/
 * FR-029) -- ranks 2-10 were deliberately sequenced after the rank-1
 * vertical slice was proven (plan.md Complexity Tracking), not part
 * of the original MVP-demoable critical path.
 */
export const REGISTRY: Record<string, string> = {
  "rank-1-boss": RANK_1_BOSS,
  "rank-1-challenger-1": RANK_1_CHALLENGER_1,
  "rank-1-challenger-2": RANK_1_CHALLENGER_2,
  "rank-1-challenger-3": RANK_1_CHALLENGER_3,
  "rank-2-boss": RANK_2_BOSS,
  "rank-2-challenger-1": RANK_2_CHALLENGER_1,
  "rank-2-challenger-2": RANK_2_CHALLENGER_2,
  "rank-2-challenger-3": RANK_2_CHALLENGER_3,
  "rank-3-boss": RANK_3_BOSS,
  "rank-3-challenger-1": RANK_3_CHALLENGER_1,
  "rank-3-challenger-2": RANK_3_CHALLENGER_2,
  "rank-3-challenger-3": RANK_3_CHALLENGER_3,
  "rank-4-boss": RANK_4_BOSS,
  "rank-4-challenger-1": RANK_4_CHALLENGER_1,
  "rank-4-challenger-2": RANK_4_CHALLENGER_2,
  "rank-4-challenger-3": RANK_4_CHALLENGER_3,
  "rank-5-boss": RANK_5_BOSS,
  "rank-5-challenger-1": RANK_5_CHALLENGER_1,
  "rank-5-challenger-2": RANK_5_CHALLENGER_2,
  "rank-5-challenger-3": RANK_5_CHALLENGER_3,
  "rank-6-boss": RANK_6_BOSS,
  "rank-6-challenger-1": RANK_6_CHALLENGER_1,
  "rank-6-challenger-2": RANK_6_CHALLENGER_2,
  "rank-6-challenger-3": RANK_6_CHALLENGER_3,
  "rank-7-boss": RANK_7_BOSS,
  "rank-7-challenger-1": RANK_7_CHALLENGER_1,
  "rank-7-challenger-2": RANK_7_CHALLENGER_2,
  "rank-7-challenger-3": RANK_7_CHALLENGER_3,
  "rank-8-boss": RANK_8_BOSS,
  "rank-8-challenger-1": RANK_8_CHALLENGER_1,
  "rank-8-challenger-2": RANK_8_CHALLENGER_2,
  "rank-8-challenger-3": RANK_8_CHALLENGER_3,
  "rank-9-boss": RANK_9_BOSS,
  "rank-9-challenger-1": RANK_9_CHALLENGER_1,
  "rank-9-challenger-2": RANK_9_CHALLENGER_2,
  "rank-9-challenger-3": RANK_9_CHALLENGER_3,
  "rank-10-boss": RANK_10_BOSS,
  "rank-10-challenger-1": RANK_10_CHALLENGER_1,
  "rank-10-challenger-2": RANK_10_CHALLENGER_2,
  "rank-10-challenger-3": RANK_10_CHALLENGER_3,
};

export function loadOpponentPilotCode(behaviorModule: string): string {
  const source = REGISTRY[behaviorModule];
  if (!source) throw new Error(`No pilot code registered for behaviorModule "${behaviorModule}"`);
  return source;
}
