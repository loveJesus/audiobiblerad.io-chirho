// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test, expect } from '@playwright/test';
import { readFileSync as readFileChirho } from 'node:fs';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho
} from './helpers-chirho/media_chirho';

const manifestChirho = JSON.parse(
	readFileChirho('.svelte-kit/output/client/.vite/manifest.json', 'utf8')
);
const sceneEntriesChirho = [
	'src/lib/spatial-chirho/listening-room-chirho/scene-chirho/room_scene_chirho.ts',
	'src/lib/spatial-chirho/scene_chirho.ts'
].map((keyChirho) => `/${manifestChirho[keyChirho].file}`);

for (const choiceChirho of ['two', 'reduced', 'limited', 'automatic']) {
	test(`room admission respects ${choiceChirho} while Scripture starts independently`, async ({
		page: pageChirho
	}) => {
		await observeMediaChirho(pageChirho);
		await pageChirho.emulateMedia({
			reducedMotion: choiceChirho === 'reduced' ? 'reduce' : 'no-preference'
		});
		await pageChirho.addInitScript((choiceChirho) => {
			localStorage.setItem(
				'audio-bible-radio-view-chirho',
				choiceChirho === 'two' ? 'two' : 'auto'
			);
			Object.defineProperty(navigator, 'deviceMemory', {
				configurable: true,
				value: choiceChirho === 'limited' ? 2 : 8
			});
			Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 });
		}, choiceChirho);
		await pageChirho.route('https://**/*', (routeChirho) =>
			routeChirho.request().url().endsWith('.mp3')
				? routeChirho.fulfill({ contentType: 'audio/wav', body: fixtureWaveChirho(60) })
				: routeChirho.fulfill({ status: 404, body: '' })
		);
		let modelRequestsChirho = 0;
		let sceneRequestsChirho = 0;
		pageChirho.on('request', (requestChirho) => {
			if (sceneEntriesChirho.includes(new URL(requestChirho.url()).pathname)) sceneRequestsChirho++;
		});
		await pageChirho.route('**/scenes-chirho/**/*.glb', async (routeChirho) => {
			modelRequestsChirho++;
			await routeChirho.abort();
		});
		await pageChirho.goto('/');
		await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
		await expect
			.poll(
				async () =>
					(await mediaStateChirho(pageChirho)).find((audioChirho) =>
						audioChirho.url_chirho.startsWith('https://')
					)?.seconds_chirho
			)
			.toBeGreaterThan(0.2);
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).blur();
		await pageChirho.waitForTimeout(3000);
		expect(modelRequestsChirho).toBe(choiceChirho === 'automatic' ? 1 : 0);
		expect(sceneRequestsChirho).toBe(choiceChirho === 'automatic' ? 1 : 0);
		await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
			'data-spatial-active-chirho',
			'false'
		);
		const audioChirho = (await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)!;
		expect(audioChirho.paused_chirho).toBe(false);
		expect(audioChirho.seconds_chirho).toBeGreaterThan(1);
	});
}
