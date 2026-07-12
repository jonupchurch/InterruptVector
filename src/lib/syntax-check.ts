/**
 * Syntax-only check -- parses without executing, using the Function
 * constructor purely as a parser (the resulting function is never
 * called). This is not a security boundary; it only catches malformed
 * JS before it's saved. Real sandboxed execution happens later in the
 * WASM interpreter (User Story 3).
 */
export interface SyntaxCheckResult {
  valid: boolean;
  message?: string;
}

export function checkPilotCodeSyntax(sourceCode: string): SyntaxCheckResult {
  try {
    new Function("api", sourceCode);
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err instanceof Error ? err.message : "Invalid JavaScript syntax." };
  }
}
