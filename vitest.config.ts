import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/server.ts", "src/config.ts"],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
  },
});
