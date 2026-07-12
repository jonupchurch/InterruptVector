/** Rank 2 practice challenger -- "The Wall". Never moves, just camps and fires -- a tankier version of rank 1's Sentry with better tracking. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
}
`;
