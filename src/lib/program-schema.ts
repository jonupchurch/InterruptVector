import { z } from "zod";

export const programInputSchema = z.object({
  name: z.string().min(1).max(100),
  sourceCode: z.string().min(1).max(100_000),
});

export type ProgramInput = z.infer<typeof programInputSchema>;
