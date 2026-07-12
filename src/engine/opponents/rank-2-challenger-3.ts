/** Rank 2 practice challenger -- "The Skirmisher". Alternates turning and advancing so it doesn't approach in a straight line. */
export const PILOT_CODE = `
let tick = 0;
function pilotCode(api) {
  tick++;
  if (tick % 4 === 0) {
    api.rotateTank("NE");
  } else if (api.canMove()) {
    api.moveForward();
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
}
`;
