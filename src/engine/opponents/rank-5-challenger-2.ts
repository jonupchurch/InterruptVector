/** Rank 5 practice challenger -- "The Juggernaut". Camps and tanks hits, only breaking off once critically low (a quarter health, not half) -- built to soak damage. */
export const PILOT_CODE = `
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 4) {
    if (api.canMove()) { api.moveBackward(); }
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
