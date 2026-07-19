import { defineConfig } from 'vitest/config';

// Test config kept separate from vite.config.ts so the production build
// (vite build) carries no test-only settings.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
