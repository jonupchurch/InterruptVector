/** Rank 9 practice challenger -- "The Assassin". Executioner's continuous-pressure pattern, now with ground judgment so its rush never stalls against costly terrain. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
  const cost = api.moveCost();
  if (cost > 0 && cost <= 2) {
    api.moveForward();
  } else if (cost === 0) {
    api.rotateTank("NN");
  }
}
`;
