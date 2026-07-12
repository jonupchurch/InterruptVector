import { z } from "zod";

export const buildInputSchema = z.object({
  name: z.string().min(1).max(100),
  chassisTier: z.number().int().min(1).max(10),
  weaponTier: z.number().int().min(1).max(10),
  sensorTier: z.number().int().min(1).max(5),
  mobilityTier: z.number().int().min(1).max(5),
  powerTier: z.number().int().min(1).max(5),
});

export type BuildInput = z.infer<typeof buildInputSchema>;
