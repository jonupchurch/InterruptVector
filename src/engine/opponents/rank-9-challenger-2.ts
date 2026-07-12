/** Rank 9 practice challenger -- "The Titan". Fortress's disciplined camping pattern, breaking off even later -- a fifth of max health -- betting on raw armor to outlast the exchange. */
export const PILOT_CODE = `
let lastBogey = null;
let retreatHeading = "SW";
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 5) {
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
    if (lastBogey.distance < 28) api.fire();
  }
}
`;
