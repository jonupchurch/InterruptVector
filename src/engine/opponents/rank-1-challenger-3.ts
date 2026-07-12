/**
 * Rank 1 practice challenger -- "The Rammer". Always pushes forward
 * regardless of what it detects, firing when it can. The most
 * aggressive, least tactical rank-1 opponent -- rewards a pilot who
 * kites or trades efficiently rather than brawling head-on.
 */
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
