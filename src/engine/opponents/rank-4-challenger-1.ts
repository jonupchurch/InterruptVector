/** Rank 4 practice challenger -- "The Phantom". Terrain-aware kiter: backs off through passable ground only, re-routing rather than getting stuck against a wall while retreating. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 12) {
      api.moveBackward();
      return;
    }
  }
  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("SE");
  }
}
`;
