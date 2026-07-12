import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Vitest doesn't load .env.local automatically (that's a Next.js
// runtime behavior, not a Vite/Vitest one) -- load it explicitly so
// src/env.ts's Zod validation sees DATABASE_URL during tests.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Missing .env.local is fine in CI, where DATABASE_URL is already set.
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
