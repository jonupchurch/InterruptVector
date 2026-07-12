import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/programs/route";

function postPrograms(body: unknown) {
  return POST(
    new Request("http://localhost/api/programs", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("POST /api/programs", () => {
  it("surfaces a syntax error as a 400 with a message, not a crash", async () => {
    const res = await postPrograms({
      name: "Broken",
      sourceCode: "if (api.sensors( { api.fire(); }",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "sourceCode" })]),
    );
  });

  it("rejects syntactically valid JS that never defines pilotCode(api) -- this must be caught at save time, not first discovered mid-battle", async () => {
    const res = await postPrograms({
      name: "Missing pilotCode",
      // Syntactically fine top-level code, but there's no `function
      // pilotCode(api) { ... }` -- this exact shape once slipped
      // through save-time validation and left a real battle stuck at
      // "simulating" forever until the underlying bug was fixed.
      sourceCode: "const bogeys = api.sensors(); if (bogeys.length > 0) { api.fire(); }",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "sourceCode" })]),
    );
  });

  it("accepts a program that actually defines pilotCode(api)", async () => {
    const res = await postPrograms({
      name: "Valid Program",
      sourceCode: `
        function pilotCode(api) {
          const bogeys = api.sensors();
          if (bogeys !== -1 && bogeys.length > 0) { api.fire(); }
        }
      `,
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Valid Program");
  });
});
