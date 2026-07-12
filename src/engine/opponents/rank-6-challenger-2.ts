/** Rank 6 practice challenger -- "The Bastion". Juggernaut's tanky camping pattern, now with alternating retreat headings like this rank's boss, so a cornered retreat doesn't stall against the same wall repeatedly. */
export const PILOT_CODE = `
let lastBogey = null;
let retreatHeading = "SW";
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 4) {
    if (api.canMove()) {
      api.moveBackward();
    } else {
      retreatHeading = retreatHeading === "SW" ? "SE" : "SW";
      api.rotateTank(retreatHeading);
    }
    return;
  }
  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) lastBogey = bogeys[0];
  }
  if (lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    api.fire();
  }
}
`;
