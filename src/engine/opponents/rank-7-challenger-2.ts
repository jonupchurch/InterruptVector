/** Rank 7 practice challenger -- "The Colossus". Bastion's tanky camping pattern, now with shot discipline -- won't fire beyond 25 squares even when it has a lock, saving its cooldown for a shot likely to land. */
export const PILOT_CODE = `
let lastBogey = null;
let retreatHeading = "SW";
function pilotCode(api) {
  const self = api.self();
  if (self.hp <= self.maxHp / 4) {
    if (api.canMove()) {
      api.moveBackward();
    } else {
      retreatHeading = retreatHeading === "SW" ? "SE" : "SW";
      api.rotateTank(retreatHeading);
    }
    return;
  }
  if (self.powerReserves > self.maxPowerReserves / 4) {
    const bogeys = api.sensors();
    if (bogeys !== -1 && bogeys.length > 0) lastBogey = bogeys[0];
  }
  if (lastBogey) {
    api.rotateTurretToXY(lastBogey.x, lastBogey.y);
    if (lastBogey.distance < 25) api.fire();
  }
}
`;
