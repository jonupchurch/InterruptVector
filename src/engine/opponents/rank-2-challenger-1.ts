/** Rank 2 practice challenger -- "The Scout". Hit-and-run: fires once in range, then falls back rather than closing further. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    api.moveBackward();
  } else if (api.canMove()) {
    api.moveForward();
  }
}
`;
