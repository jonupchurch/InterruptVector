/** Rank 8 practice challenger -- "The Fortress". Colossus's disciplined camping pattern, now also alternating retreat headings like this rank's boss when it does break off. */
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
    if (lastBogey.distance < 25) api.fire();
  }
}
`;
