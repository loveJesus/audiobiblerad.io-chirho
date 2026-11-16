// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test, expect, type Page as PageChirho } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho,
	mediaEventsChirho
} from './helpers-chirho/media_chirho';
import { effectEventChirho, effectSequenceChirho } from './helpers-chirho/effect_playback_chirho';
import type { SoundProfileChirho } from '../src/lib/sounds-chirho/sound_profile_chirho';

test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
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
});

async function openChirho(pageChirho: PageChirho): Promise<SoundProfileChirho> {
	const responseChirho = pageChirho.waitForResponse('**/sounds-chirho/profile_chirho.json');
	await pageChirho.goto('/');
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
	return (await responseChirho).json();
}

test('a keyboard knob step plays its prepared effect before the radio is On', async ({
	page: pageChirho
}) => {
	const profileChirho = await openChirho(pageChirho);
	const beforeChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true }).press('ArrowUp');
	await effectEventChirho(
		pageChirho,
		profileChirho.knob_chirho[0].url_chirho,
		'playing',
		beforeChirho
	);
	await effectEventChirho(
		pageChirho,
		profileChirho.knob_chirho[0].url_chirho,
		'ended',
		beforeChirho
	);
	expect(
		(await mediaStateChirho(pageChirho)).some((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)
	).toBe(false);
	await expect(
		pageChirho.getByRole('button', { name: 'Radio power', exact: true })
	).toHaveAttribute('aria-pressed', 'false');
});

test('the FM dial sounds while being dragged and changes the stream only on release', async ({
	page: pageChirho
}) => {
	const profileChirho = await openChirho(pageChirho);
	const onSequenceChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await effectEventChirho(
		pageChirho,
		profileChirho.click_chirho[0].url_chirho,
		'ended',
		onSequenceChirho
	);
	await expect
		.poll(
			async () =>
				(await mediaStateChirho(pageChirho)).find((audioChirho) =>
					audioChirho.url_chirho.startsWith('https://')
				)?.seconds_chirho
		)
		.toBeGreaterThan(0.2);
	const beforeChirho = await effectSequenceChirho(pageChirho);
	const dialChirho = pageChirho.getByRole('slider', { name: 'Station dial', exact: true });
	const boxChirho = (await dialChirho.boundingBox())!;
	await pageChirho.mouse.move(boxChirho.x + 8, boxChirho.y + boxChirho.height / 2);
	await pageChirho.mouse.down();
	try {
		await pageChirho.mouse.move(
			boxChirho.x + boxChirho.width * 0.25,
			boxChirho.y + boxChirho.height / 2,
			{ steps: 6 }
		);
		await effectEventChirho(
			pageChirho,
			profileChirho.knob_chirho[0].url_chirho,
			'playing',
			beforeChirho
		);
		expect(
			(await mediaEventsChirho(pageChirho)).filter(
				(eventChirho) =>
					eventChirho.kind_chirho === 'play_call_chirho' &&
					eventChirho.requested_url_chirho?.startsWith('https://')
			)
		).toHaveLength(1);
	} finally {
		await pageChirho.mouse.up();
	}
	await expect
		.poll(
			async () =>
				(await mediaEventsChirho(pageChirho)).filter(
					(eventChirho) =>
						eventChirho.kind_chirho === 'play_call_chirho' &&
						eventChirho.requested_url_chirho?.startsWith('https://')
				).length
		)
		.toBe(2);
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 0
			)
		)
		.toBe(true);
});
