import { describe, expect, it } from "vitest";
import { checkPilotCodeSyntax } from "./syntax-check";

describe("checkPilotCodeSyntax", () => {
  it("accepts valid JavaScript", () => {
    const result = checkPilotCodeSyntax("if (api.sensors().length > 0) { api.fire(); }");
    expect(result.valid).toBe(true);
  });

  it("rejects malformed JavaScript without throwing", () => {
    const result = checkPilotCodeSyntax("if (api.sensors( { api.fire(); }");
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });
});
