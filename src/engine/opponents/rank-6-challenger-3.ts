/** Rank 6 practice challenger -- "The Stalker". Holds fire and stays hidden (no scanning) until the opponent is within 20 squares, then commits fully -- a patience test rather than a reflex test. */
export const PILOT_CODE = `
let engaged = false;
function pilotCode(api) {
  if (!engaged) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0 && bogeys[0].distance < 20) {
      engaged = true;
      api.log("Contact -- engaging.");
    } else if (api.canMove()) {
      api.moveForward();
    }
    return;
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
  if (api.canMove()) { api.moveForward(); }
}
`;
