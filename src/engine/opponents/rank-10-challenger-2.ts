/** Rank 10 practice challenger -- "The Monolith". The ladder's most stubborn camper -- Titan's pattern, never breaking off below a fifth health, just holding and firing until it or the target drops. */
export const PILOT_CODE = `
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 5 && api.canMove()) {
    api.moveBackward();
  }
  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) lastBogey = bogeys[0];
  }
  if (lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    if (lastBogey.distance < 30) api.fire();
  }
}
`;
