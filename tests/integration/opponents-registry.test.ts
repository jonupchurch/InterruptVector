import { describe, expect, it } from "vitest";
import { checkPilotCodeSyntax } from "@/lib/syntax-check";
import { verifyPilotCodeIsDefined } from "@/engine/sandbox/interpreter";
import { REGISTRY } from "@/engine/opponents/registry";

describe("opponent registry", () => {
  it("has exactly 40 entries: 10 bosses + 30 challengers across 10 ranks", () => {
    expect(Object.keys(REGISTRY)).toHaveLength(40);
  });

  it.each(Object.entries(REGISTRY))("%s is syntactically valid pilot code that defines pilotCode(api)", async (_name, source) => {
    const syntax = checkPilotCodeSyntax(source);
    expect(syntax.valid).toBe(true);

    const defined = await verifyPilotCodeIsDefined(source);
    expect(defined.valid).toBe(true);
  });
});
