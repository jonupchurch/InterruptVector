/**
 * Rank 8 boss -- "The Overseer". Adds ground judgment: reads
 * moveCost() before committing to advance, and holds position to
 * fight instead of pushing through costly terrain (swamp, hills)
 * that would strand it mid-approach.
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
    if (lastBogey.distance < 25) api.fire();
  }

  const cost = api.moveCost();
  if (cost > 0 && cost <= 2) {
    api.moveForward();
  } else if (cost === 0) {
    api.rotateTank("NE");
  }
}
`;
