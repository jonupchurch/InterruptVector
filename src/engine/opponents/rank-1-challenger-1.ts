/**
 * Rank 1 practice challenger -- "The Drone". Simpler than the boss:
 * always advances, fires opportunistically without actively aiming.
 * Meant to be an easy warm-up fight, not a real test.
 */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.fire();
  }
  if (api.canMove()) {
    api.moveForward();
  }
}
`;
