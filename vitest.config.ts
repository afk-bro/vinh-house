import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*": ["./*"] path alias for test runs.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
