/** Rank 5 practice challenger -- "The Reaper". No retreat logic at all, unlike everything else at this rank -- pure relentless pressure, a live test of whether a pilot's own kiting actually works. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
  if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NN");
  }
}
`;
