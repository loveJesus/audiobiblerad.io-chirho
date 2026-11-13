// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { defineConfig } from '@playwright/test';

// Playwright explicitly sets FORCE_COLOR on child processes. Keep one color policy for those children.
delete process.env.NO_COLOR;

export default defineConfig({
	workers: 2,
	use: { actionTimeout: 5000 },
	webServer: { command: 'bun run build && bun run preview', port: 4173 },
	testDir: 'tests-chirho',
	testMatch: '**/*.e2e.{ts,js}'
});
