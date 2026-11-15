// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, test } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho
} from './helpers-chirho/media_chirho';

test('a delayed chapter gets one brief cue, not a looping effect while it loads', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho);
	let releaseChirho = (): void => undefined;
	const gateChirho = new Promise<void>((resolveChirho) => {
		releaseChirho = resolveChirho;
	});
	await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
		routeChirho.fulfill({ json: {} })
	);
	await pageChirho.route('https://**/*.mp3', async (routeChirho) => {
		await gateChirho;
		await routeChirho.fulfill({ contentType: 'audio/wav', body: fixtureWaveChirho() });
	});
	try {
		await pageChirho.goto('/');
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
		await expect
			.poll(async () =>
				(await mediaStateChirho(pageChirho)).some(
					(audioChirho) =>
						audioChirho.url_chirho.includes('/sounds-chirho/') && !audioChirho.paused_chirho
				)
			)
			.toBe(true);
		await expect
			.poll(
				async () =>
					(await mediaStateChirho(pageChirho)).every(
						(audioChirho) =>
							!audioChirho.url_chirho.includes('/sounds-chirho/') || audioChirho.paused_chirho
					),
				{ timeout: 2200 }
			)
			.toBe(true);
		await expect(
			pageChirho.getByRole('button', { name: 'Radio power', exact: true })
		).toBeVisible();
		releaseChirho();
		await expect
			.poll(async () =>
				(await mediaStateChirho(pageChirho)).some(
					(audioChirho) =>
						audioChirho.url_chirho.startsWith('https://') &&
						!audioChirho.paused_chirho &&
						audioChirho.seconds_chirho > 0.1
				)
			)
			.toBe(true);
	} finally {
		releaseChirho();
	}
});
