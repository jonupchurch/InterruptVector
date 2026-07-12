/**
 * Rank 7 boss -- "The Sentinel". Adds shot discipline on top of rank
 * 6's full mode/power/terrain package: won't fire wildly at extreme
 * range, closing distance first instead of wasting a cooldown cycle
 * on a low-odds shot.
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
    if (lastBogey.distance < 25) {
      api.fire();
    }
  }
  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
