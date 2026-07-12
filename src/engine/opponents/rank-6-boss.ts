/**
 * Rank 6 boss -- "The Enforcer". Combines everything so far (named
 * mode state machine, power-gated scanning, terrain-aware movement)
 * and adds alternating retreat headings so it doesn't back itself
 * into the same wall twice.
 */
export const PILOT_CODE = `
let mode = "patrol";
let lastBogey = null;
let retreatHeading = "SW";
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
    if (mode === "retreat") retreatHeading = retreatHeading === "SW" ? "SE" : "SW";
  }

  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    lastBogey = bogeys !== -1 && bogeys.length > 0 ? bogeys[0] : null;
  }

  if (mode === "retreat") {
    if (api.canMove()) { api.moveBackward(); } else { api.rotateTank(retreatHeading); }
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
