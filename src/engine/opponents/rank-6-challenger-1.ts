/** Rank 6 practice challenger -- "The Nomad". Never stops moving, even mid-engagement -- alternates forward and backward every few ticks while still tracking and firing, denying a stationary shot. */
export const PILOT_CODE = `
let tick = 0;
function pilotCode(api) {
  tick++;
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
  if (api.canMove()) {
    if (tick % 6 < 3) { api.moveForward(); } else { api.moveBackward(); }
  }
}
`;
