// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'bun run build && bun run preview', port: 4173 },
	testDir: 'tests-chirho',
	testMatch: '**/*.e2e.{ts,js}'
});
