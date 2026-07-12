import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/builds/route";

function postBuilds(body: unknown) {
  return POST(
    new Request("http://localhost/api/builds", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("POST /api/builds", () => {
  it("rejects a build whose combined weight exceeds the chassis's weight capacity", async () => {
    // Whippet (tier 1, weightCapacity 6) + tier-10 weapon (6) + tier-5 mobility (5) + tier-5 power (5) = 16
    const res = await postBuilds({
      name: "Overweight",
      chassisTier: 1,
      weaponTier: 10,
      sensorTier: 1,
      mobilityTier: 5,
      powerTier: 5,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "weight" })]),
    );
  });

  it("rejects a build with a tier above the seeded profile's unlocked rank (rank 1)", async () => {
    const res = await postBuilds({
      name: "Too Advanced",
      chassisTier: 1,
      weaponTier: 1,
      sensorTier: 2, // rank 1 only unlocks sensor tier 1
      mobilityTier: 1,
      powerTier: 1,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "tiers" })]),
    );
  });
});
