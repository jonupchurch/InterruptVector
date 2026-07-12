/**
 * Rank 10 boss -- "The Successor's Vanguard". The ladder's final
 * gate, and the most complete opponent built: everything every prior
 * rank introduced (named mode state machine, power-gated scanning,
 * shot discipline, ground judgment, alternating retreat headings),
 * tuned tightest here. Still bounded by the same rule as every rank
 * before it -- hand-coded, not adaptive, not learning (Principle II)
 * -- it just makes fewer mistakes than the others.
 */
export const PILOT_CODE = `
let mode = "patrol";
let lastBogey = null;
let retreatHeading = "SW";
function pilotCode(api) {
  const self = api.self();
  const previousMode = mode;

  if (self.hp <= self.maxHp / 3) {
    mode = "retreat";
  } else if (lastBogey) {
    mode = "engage";
  } else {
    mode = "patrol";
  }
  if (mode !== previousMode) {
    api.log("Vanguard: " + mode);
    if (mode === "retreat") retreatHeading = retreatHeading === "SW" ? "SE" : "SW";
  }

  if (self.powerReserves > self.maxPowerReserves / 3) {
    const bogeys = api.sensors();
    lastBogey = bogeys !== -1 && bogeys.length > 0 ? bogeys[0] : null;
  }

  if (mode === "retreat") {
    if (api.canMove()) { api.moveBackward(); } else { api.rotateTank(retreatHeading); }
    return;
  }
  if (mode === "engage" && lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    if (lastBogey.distance < 30) api.fire();
  }

  const cost = api.moveCost();
  if (cost > 0 && cost <= 2) {
    api.moveForward();
  } else if (cost === 0) {
    api.rotateTank("NE");
  }
}
`;
