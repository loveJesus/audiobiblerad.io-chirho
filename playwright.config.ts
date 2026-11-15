// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { defineConfig } from '@playwright/test';

const TEST_PORT_CHIRHO = Number(process.env.PLAYWRIGHT_PORT_CHIRHO ?? 4186);

// Playwright explicitly sets FORCE_COLOR on child processes. Keep one color policy for those children.
delete process.env.NO_COLOR;

export default defineConfig({
	workers: 2,
	use: { actionTimeout: 5000, baseURL: `http://127.0.0.1:${TEST_PORT_CHIRHO}` },
	webServer: {
		command: `bun run build && bunx wrangler dev .svelte-kit/cloudflare/_worker.js --port ${TEST_PORT_CHIRHO} --env-file ./wrangler-bindings-chirho.env`,
		port: TEST_PORT_CHIRHO
	},
	testDir: 'tests-chirho',
	testMatch: '**/*.e2e.{ts,js}'
});
