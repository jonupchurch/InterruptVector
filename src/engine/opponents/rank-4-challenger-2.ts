/** Rank 4 practice challenger -- "The Anvil". Camping Bulwark pattern, now power-aware: skips a scan when Reserves are low instead of risking overload. */
export const PILOT_CODE = `
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 2) { api.moveBackward(); }
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
