import { defineConfig } from "vitest/config";
import path from "path";

// Define global variables for tests
if (typeof (globalThis as any).__DEV__ === 'undefined') {
  (globalThis as any).__DEV__ = false;
}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
