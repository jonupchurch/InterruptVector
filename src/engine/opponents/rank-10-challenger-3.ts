/** Rank 10 practice challenger -- "The Harbinger". Assassin's relentless-pressure-with-ground-judgment pattern, tuned as the ladder's final aggression check before the boss itself. */
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
