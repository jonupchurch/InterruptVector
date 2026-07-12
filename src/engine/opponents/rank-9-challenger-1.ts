/** Rank 9 practice challenger -- "The Specter". Wraith's kiting-with-ground-judgment pattern at an even longer 18-square break distance, testing sustained pursuit. */
export const PILOT_CODE = `
let tick = 0;
function pilotCode(api) {
  tick++;
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 18) {
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
