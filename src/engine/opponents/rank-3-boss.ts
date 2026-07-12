/**
 * Rank 3 boss -- "The Tactician". First opponent to manage its own
 * power budget: skips scanning when Reserves are running low so it
 * doesn't risk overload, relying on its last-known bogey position
 * instead until Reserves recover.
 */
export const PILOT_CODE = `
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 2) {
    api.moveBackward();
    return;
  }

  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) {
      lastBogey = bogeys[0];
    }
  }

  if (lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    api.fire();
    api.moveForward();
  } else if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
