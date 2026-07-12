/**
 * Rank 4 boss -- "The Warden". First opponent that's terrain-aware:
 * checks canMove() before committing forward, and picks a different
 * heading rather than stalling against impassable ground.
 */
export const PILOT_CODE = `
let lastBogey = null;
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 2) {
    if (api.canMove()) { api.moveBackward(); } else { api.rotateTank("SW"); }
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

  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
