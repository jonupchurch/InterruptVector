/** Rank 10 practice challenger -- "The Herald". Specter's long-range kiting pattern at the ladder's widest break distance -- 22 squares -- the ultimate test of closing distance against a mover. */
export const PILOT_CODE = `
let tick = 0;
function pilotCode(api) {
  tick++;
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 22) {
      if (api.canMove()) { api.moveBackward(); }
      return;
    }
  }
  const cost = api.moveCost();
  if (cost > 0 && cost <= 2 && tick % 6 < 4) {
    api.moveForward();
  }
}
`;
