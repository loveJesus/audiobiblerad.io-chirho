// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileChirho } from 'node:fs';
import { test, expect } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho
} from './helpers-chirho/media_chirho';

// Resolve the built entry rather than pinning a generated chunk name or size.
const manifestChirho = JSON.parse(
	readFileChirho('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
);
const scenePathChirho = `/${manifestChirho['src/lib/spatial-chirho/scene_chirho.ts'].file}`;

for (const preferenceChirho of ['auto', 'three']) {
	test(`3D waits for this visit's switch even with a stored ${preferenceChirho} choice`, async ({
		page: pageChirho
	}) => {
		await observeMediaChirho(pageChirho);
		await pageChirho.emulateMedia({ reducedMotion: 'no-preference' });
		await pageChirho.addInitScript((preferenceChirho) => {
			localStorage.setItem('audio-bible-radio-view-chirho', preferenceChirho);
			Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 });
			Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 });
		}, preferenceChirho);
		await pageChirho.route('https://**/*.mp3', (routeChirho) =>
			routeChirho.fulfill({
				contentType: 'audio/wav',
				body: fixtureWaveChirho(30),
				headers: { 'accept-ranges': 'bytes' }
			})
		);
		await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
			routeChirho.fulfill({ status: 404, body: '' })
		);
		let sceneRequestsChirho = 0;
		await pageChirho.route(`**${scenePathChirho}`, async (routeChirho) => {
			sceneRequestsChirho += 1;
			await routeChirho.abort();
		});
		await pageChirho.goto('/');
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
		await expect
			.poll(
				async () =>
					(await mediaStateChirho(pageChirho)).find((audioChirho) =>
						audioChirho.url_chirho.startsWith('https://')
					)?.seconds_chirho
			)
			.toBeGreaterThan(0.2);
		// Cover the previous delayed auto-start window after audio has actually begun.
		await pageChirho.waitForTimeout(2500);
		expect(sceneRequestsChirho).toBe(0);
		await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
		const audioBeforeChirho = (await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)!;
		// The failed module load immediately returns the switch to simple, so click is the action.
		await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).click();
		await expect.poll(() => sceneRequestsChirho).toBe(1);
		await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
			'data-spatial-loading-chirho',
			'false'
		);
		const audioAfterChirho = (await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)!;
		expect(audioAfterChirho.url_chirho).toBe(audioBeforeChirho.url_chirho);
		expect(audioAfterChirho.paused_chirho).toBe(false);
		expect(audioAfterChirho.seconds_chirho).toBeGreaterThanOrEqual(
			audioBeforeChirho.seconds_chirho
		);
		await expect(
			pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true })
		).not.toBeChecked();
	});
}
