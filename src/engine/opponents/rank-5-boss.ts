/**
 * Rank 5 boss -- "The Strategist". First opponent with an explicit
 * named mode state machine (patrol / engage / retreat) instead of an
 * implicit if-chain, and uses log() for in-character radio chatter on
 * every mode transition.
 */
export const PILOT_CODE = `
let mode = "patrol";
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  const previousMode = mode;

  if (self.hp <= self.maxHp / 2) {
    mode = "retreat";
  } else if (lastBogey) {
    mode = "engage";
  } else {
    mode = "patrol";
  }
  if (mode !== previousMode) {
    api.log("Mode: " + mode);
  }

  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) lastBogey = bogeys[0];
    else lastBogey = null;
  }

  if (mode === "retreat") {
    if (api.canMove()) { api.moveBackward(); } else { api.rotateTank("SW"); }
    return;
  }
  if (mode === "engage" && lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    api.fire();
  }
  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
