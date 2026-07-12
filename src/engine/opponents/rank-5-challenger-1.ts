/** Rank 5 practice challenger -- "The Ranger". Kites at longer range than the Harrier/Phantom before it, disengaging at 15 squares instead of 10-12. */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
    if (bogeys[0].distance < 15) {
      if (api.canMove()) { api.moveBackward(); } else { api.rotateTank("SE"); }
      return;
    }
  }
  if (api.canMove()) {
    api.moveForward();
  }
}
`;
