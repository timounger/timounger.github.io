/**
 * Vitest configuration for unit tests of the pure POS and helper logic.
 *
 * @module
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],
  },
});
