import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Same `@/*` alias as tsconfig.json.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
