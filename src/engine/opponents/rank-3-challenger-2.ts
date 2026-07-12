/** Rank 3 practice challenger -- "The Bulwark". Camps like rank 2's Wall, but retreats below half health instead of fighting to the end. */
export const PILOT_CODE = `
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 2) {
    api.moveBackward();
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  }
}
`;
