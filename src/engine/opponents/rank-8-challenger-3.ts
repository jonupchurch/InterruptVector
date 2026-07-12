/** Rank 8 practice challenger -- "The Executioner". Predator's committed-aggression pattern, now firing continuously while closing rather than only after the ambush trigger. */
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
