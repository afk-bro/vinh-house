// SITE_URL (lib/seo.ts) is resolved from env at module load. The surrounding environment can
// carry values that would make tests non-deterministic — notably Vercel injects VERCEL_* during
// the `prebuild` test run. Clear them here so the baseline is always the placeholder fallback;
// tests that need a specific value set it explicitly via vi.stubEnv + a fresh dynamic import.
delete process.env.NEXT_PUBLIC_SITE_URL;
delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
delete process.env.VERCEL_URL;
