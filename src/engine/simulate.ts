import { advanceTankQueues, installApi } from "./sandbox/api-bindings";
import { looksLikeMemoryLimitError } from "./sandbox/memory-guard";
import { createSandbox, type Sandbox } from "./sandbox/interpreter";
import {
  createRunawayTracker,
  MAX_CONSECUTIVE_RUNAWAY_VIOLATIONS,
  recordCleanTick,
  recordRunawayViolation,
} from "./sandbox/error-handling";
import { tickPowerBalance } from "./power";
import { createTankRuntimeState, type LogEntry, type TankParts, type TankRuntimeState } from "./tank-state";
import { generateTerrainGrid, GRID_SIZE } from "./terrain";
import { createTickLogRecorder, type TickLog } from "./replay-log";

/** Match tick cap (spec FR-018): 3,000 ticks default, at 10 ticks/second of simulated time. */
export const DEFAULT_MAX_TICKS = 3000;

const PLAYER_SPAWN = { x: 5, y: 5 };
const OPPONENT_SPAWN = { x: GRID_SIZE - 6, y: GRID_SIZE - 6 };

export interface SimulateBattleParams {
  playerParts: TankParts;
  playerSourceCode: string;
  opponentParts: TankParts;
  opponentSourceCode: string;
  seed: string;
  maxTicks?: number;
}

export interface SimulateBattleResult {
  outcome: "win" | "loss"; // from the player's perspective
  finalTick: number;
  tickLog: TickLog;
}

function continuousPowerDraw(parts: TankParts): number {
  return parts.sensor.powerDraw + parts.mobility.powerDraw + parts.weapon.powerDraw;
}

interface Combatant {
  state: TankRuntimeState;
  sandbox: Sandbox;
  runaway: ReturnType<typeof createRunawayTracker>;
  forfeited: boolean;
}

async function createCombatant(id: string, parts: TankParts, sourceCode: string, position: { x: number; y: number }, headingIndex: number): Promise<Combatant> {
  const state = createTankRuntimeState(id, parts, position);
  state.headingIndex = headingIndex;
  state.turretBearingDegrees = headingIndex * 45;
  const sandbox = await createSandbox(sourceCode);
  return { state, sandbox, runaway: createRunawayTracker(), forfeited: false };
}

export async function simulateBattle(params: SimulateBattleParams): Promise<SimulateBattleResult> {
  const maxTicks = params.maxTicks ?? DEFAULT_MAX_TICKS;
  const terrain = generateTerrainGrid(params.seed);
  const recorder = createTickLogRecorder();

  const player = await createCombatant("player", params.playerParts, params.playerSourceCode, PLAYER_SPAWN, 1);
  const opponent = await createCombatant("opponent", params.opponentParts, params.opponentSourceCode, OPPONENT_SPAWN, 5);

  const tickLogs: LogEntry[] = [];
  let currentTick = 0;
  const onLog = (entry: LogEntry) => tickLogs.push(entry);

  function runTick(actor: Combatant, other: Combatant) {
    if (actor.forfeited || actor.state.destroyed || other.state.destroyed) return;
    const logCountThisTick = { value: 0 };
    const apiHandle = installApi(actor.sandbox.context, {
      self: actor.state,
      opponent: other.state,
      terrain,
      currentTick: () => currentTick,
      onLog,
      logCountThisTick,
    });
    const result = actor.sandbox.callPilotCode(apiHandle);
    apiHandle.dispose();

    if (result.kind === "runaway") {
      const { tracker, forfeited } = recordRunawayViolation(actor.runaway);
      actor.runaway = tracker;
      onLog({ tick: currentTick, tankId: actor.state.id, source: "system", message: `Runaway execution (step budget exceeded) -- ${tracker.consecutiveViolations}/${MAX_CONSECUTIVE_RUNAWAY_VIOLATIONS} consecutive.` });
      if (forfeited) {
        actor.forfeited = true;
        onLog({ tick: currentTick, tankId: actor.state.id, source: "system", message: "Match forfeited: three consecutive runaway-execution violations." });
      }
    } else if (result.kind === "error") {
      const isMemory = looksLikeMemoryLimitError(result.message);
      if (isMemory) {
        const { tracker, forfeited } = recordRunawayViolation(actor.runaway);
        actor.runaway = tracker;
        if (forfeited) actor.forfeited = true;
      } else {
        actor.runaway = recordCleanTick();
      }
      onLog({ tick: currentTick, tankId: actor.state.id, source: "system", message: `Pilot code error: ${result.message}` });
    } else {
      actor.runaway = recordCleanTick();
    }

    advanceTankQueues(actor.state, other.state, terrain);
    actor.state.power = tickPowerBalance(actor.state.power, continuousPowerDraw(actor.state.parts));
  }

  for (currentTick = 1; currentTick <= maxTicks; currentTick++) {
    tickLogs.length = 0;
    runTick(player, opponent);
    runTick(opponent, player);

    recorder.record({
      tick: currentTick,
      tanks: {
        player: snapshotOf(player.state),
        opponent: snapshotOf(opponent.state),
      },
      logs: [...tickLogs],
    });

    if (player.state.destroyed || opponent.state.destroyed || player.forfeited || opponent.forfeited) {
      break;
    }
  }

  player.sandbox.dispose();
  opponent.sandbox.dispose();

  const outcome = determineOutcome(player, opponent);
  return { outcome, finalTick: currentTick > maxTicks ? maxTicks : currentTick, tickLog: recorder.getLog() };
}

function snapshotOf(state: TankRuntimeState) {
  return {
    hp: state.hp,
    x: state.position.x,
    y: state.position.y,
    headingIndex: state.headingIndex,
    turretBearingDegrees: state.turretBearingDegrees,
    powerReserves: state.power.reserves,
    overloaded: state.power.overloaded,
  };
}

function determineOutcome(player: Combatant, opponent: Combatant): "win" | "loss" {
  if (player.forfeited) return "loss";
  if (opponent.forfeited) return "win";
  if (opponent.state.destroyed && !player.state.destroyed) return "win";
  // Any other case -- player destroyed, both destroyed same tick, or
  // the match timed out with neither destroyed -- is a loss. No
  // partial credit for damage dealt or HP remaining (spec FR-018).
  return "loss";
}
