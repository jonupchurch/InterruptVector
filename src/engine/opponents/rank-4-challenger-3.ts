/** Rank 4 practice challenger -- "The Viper". Aggressive Hunter pattern, now terrain-aware so it doesn't stall its rush against blocked ground. */
export const PILOT_CODE = `
function pilotCode(api) {
  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NW");
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
  }
  api.fire();
}
`;
