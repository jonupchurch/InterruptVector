/**
 * Rank 2 boss -- "The Marksman". First opponent to use HP-relative
 * judgment: breaks off and retreats below half health instead of
 * trading blindly to the death.
 */
export const PILOT_CODE = `
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 2) {
    api.moveBackward();
    return;
  }
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    api.moveForward();
  } else if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
