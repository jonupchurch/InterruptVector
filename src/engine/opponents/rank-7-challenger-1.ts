/** Rank 7 practice challenger -- "The Ghost". Nomad's constant-motion pattern combined with the Ranger's long-range kiting, at a 15-square break distance. */
export const PILOT_CODE = `
let tick = 0;
function pilotCode(api) {
  tick++;
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 15) {
      if (api.canMove()) { api.moveBackward(); }
      return;
    }
  }
  if (api.canMove()) {
    if (tick % 6 < 4) { api.moveForward(); }
  }
}
`;
