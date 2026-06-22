import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*": ["./*"] path alias for test runs.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    // Normalize SITE_URL-affecting env vars before any test module loads (see vitest.setup.ts).
    setupFiles: ['./vitest.setup.ts'],
  },
});
