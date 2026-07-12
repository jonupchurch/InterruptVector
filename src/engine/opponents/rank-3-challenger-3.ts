/** Rank 3 practice challenger -- "The Hunter". Pure aggression: always closes distance and fires, never retreats, banking on raw damage output. */
export const PILOT_CODE = `
function pilotCode(api) {
  if (api.canMove()) {
    api.moveForward();
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
  }
  api.fire();
}
`;
