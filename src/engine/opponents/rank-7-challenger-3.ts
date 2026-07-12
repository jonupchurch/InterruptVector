/** Rank 7 practice challenger -- "The Predator". Stalker's ambush pattern, but once committed it never disengages, even below half health -- an aggression check on top of a patience check. */
export const PILOT_CODE = `
let engaged = false;
function pilotCode(api) {
  if (!engaged) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0 && bogeys[0].distance < 20) {
      engaged = true;
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
