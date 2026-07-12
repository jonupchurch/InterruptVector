/** Rank 3 practice challenger -- "The Harrier". Distance-aware kiting: only backs off when the target has closed within 10 squares, otherwise holds and fires. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 10) {
      api.moveBackward();
    }
  } else if (api.canMove()) {
    api.moveForward();
  }
}
`;
