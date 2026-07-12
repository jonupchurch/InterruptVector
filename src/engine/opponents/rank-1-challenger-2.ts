/**
 * Rank 1 practice challenger -- "The Sentry". Never moves; camps and
 * fires whenever something is detected. Tests a pilot's ability to
 * close distance and land shots against a stationary, always-aiming
 * target -- a different shape of easy fight than the Drone.
 */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
}
`;
