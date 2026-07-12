/**
 * Rank 1 boss -- "The Watchman". Simple, intentionally unthreatening:
 * scans every tick, turns to face and fires on anything it detects,
 * otherwise advances. No terrain awareness, no evasion -- rank 1 is
 * meant to be beatable by a first working program (Progression wiki:
 * "bosses get smarter, not just stronger," bounded by realistic
 * hand-coding effort for a low rank).
 */
export const PILOT_CODE = `
function pilotCode(api) {
  const bogeys = api.sensors();
  if (bogeys !== -1 && bogeys.length > 0) {
    api.rotateTurretToXY(bogeys[0].x, bogeys[0].y);
    api.fire();
  } else if (api.canMove()) {
    api.moveForward();
  } else {
    api.rotateTank("NE");
  }
}
`;
