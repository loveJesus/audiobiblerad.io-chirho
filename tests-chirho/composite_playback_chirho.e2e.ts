// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import {
	fixtureWaveChirho,
	mediaStateChirho,
	observeMediaChirho
} from './helpers-chirho/media_chirho';

const PREFERENCES_KEY_CHIRHO = 'audio-bible-radio-preferences-chirho';
const PART_ONE_CHIRHO = 'https://audio.dbs.org/FRABSF_DAVR_FB_N/29_Joel_02.mp3';
const PART_TWO_CHIRHO = 'https://audio.dbs.org/FRABSF_DAVR_FB_N/29_Joel_03.mp3';
const frenchFileChirho = JSON.parse(
	readFileSync('static/catalogue-chirho/languages-chirho/f/fr.json', 'utf8')
);
const frenchStationChirho = frenchFileChirho.stations_chirho[0];
// Short generated decoder fixtures replace both source files and their measured lengths.
frenchStationChirho.composite_chapters_chirho.JOL['2'] = {
	parts_chirho: [
		{ url_chirho: PART_ONE_CHIRHO, duration_seconds_chirho: 3 },
		{ url_chirho: PART_TWO_CHIRHO, duration_seconds_chirho: 4 }
	],
	measured_on_chirho: '2026-11-13'
};

test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
	await pageChirho.addInitScript(
		({ key_chirho: keyChirho, station_id_chirho: stationIdChirho }) => {
			if (sessionStorage.getItem('composite-fixture-seeded-chirho')) return;
			sessionStorage.setItem('composite-fixture-seeded-chirho', 'yes');
			localStorage.setItem(
				keyChirho,
				JSON.stringify({
					station_id_chirho: stationIdChirho,
					language_code_chirho: 'fr',
					book_id_chirho: 'JOL',
					chapter_chirho: 2,
					seconds_chirho: 0,
					sounds_enabled_chirho: false
				})
			);
		},
		{ key_chirho: PREFERENCES_KEY_CHIRHO, station_id_chirho: frenchStationChirho.id_chirho }
	);
	await pageChirho.route('**/catalogue-chirho/languages-chirho/f/fr.json', (routeChirho) =>
		routeChirho.fulfill({ json: frenchFileChirho })
	);
	await pageChirho.route('https://**/*.mp3', (routeChirho) => {
		const addressChirho = routeChirho.request().url();
		return routeChirho.fulfill({
			status: 200,
			contentType: 'audio/wav',
			body: fixtureWaveChirho(
				addressChirho === PART_ONE_CHIRHO ? 3 : addressChirho === PART_TWO_CHIRHO ? 4 : 15
			),
			headers: { 'accept-ranges': 'bytes' }
		});
	});
});

async function waitForPartChirho(
	pageChirho: Page,
	addressChirho: string,
	playingChirho: boolean
): Promise<void> {
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho === addressChirho &&
					audioChirho.duration_chirho > 0 &&
					audioChirho.paused_chirho !== playingChirho
			)
		)
		.toBe(true);
}

async function seekChapterChirho(pageChirho: Page, secondsChirho: number): Promise<void> {
	await pageChirho
		.getByRole('slider', { name: 'Chapter position', exact: true })
		.evaluate((elementChirho, valueChirho) => {
			const inputChirho = elementChirho as HTMLInputElement;
			inputChirho.value = String(valueChirho);
			inputChirho.dispatchEvent(new Event('input', { bubbles: true }));
			inputChirho.dispatchEvent(new Event('change', { bubbles: true }));
		}, secondsChirho);
}

async function endActivePartChirho(pageChirho: Page): Promise<void> {
	await pageChirho.evaluate(() => {
		const audioChirho = (
			window as unknown as { audioElementsChirho: HTMLAudioElement[] }
		).audioElementsChirho.find((elementChirho) => elementChirho.currentSrc.startsWith('https://'))!;
		audioChirho.currentTime = audioChirho.duration - 0.15;
	});
}

test('the real decoder continues parts within one chapter, then advances only after the final file', async ({
	page: pageChirho
}) => {
	const requestedChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		if (requestChirho.url().endsWith('.mp3')) requestedChirho.push(requestChirho.url());
	});
	await pageChirho.goto('/');
	const chapterChirho = pageChirho.getByRole('combobox', { name: 'Chapter', exact: true });
	await expect(chapterChirho).toHaveValue('2');
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await waitForPartChirho(pageChirho, PART_ONE_CHIRHO, true);
	expect(requestedChirho).not.toContain(PART_TWO_CHIRHO);
	await expect(
		pageChirho.getByRole('slider', { name: 'Chapter position', exact: true })
	).toHaveAttribute('max', '7');
	await endActivePartChirho(pageChirho);
	await waitForPartChirho(pageChirho, PART_TWO_CHIRHO, true);
	await expect(chapterChirho).toHaveValue('2');
	await endActivePartChirho(pageChirho);
	await expect(chapterChirho).toHaveValue('3');
	await waitForPartChirho(
		pageChirho,
		'https://audio.dbs.org/FRABSF_DAVR_FB_N/29_Joel_04.mp3',
		true
	);
});

test('whole-chapter seeking crosses both ways and reopening starts directly in the later file', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await waitForPartChirho(pageChirho, PART_ONE_CHIRHO, true);
	await pageChirho.getByRole('button', { name: 'Pause Scripture', exact: true }).click();
	await seekChapterChirho(pageChirho, 5);
	await waitForPartChirho(pageChirho, PART_TWO_CHIRHO, false);
	expect(
		(await mediaStateChirho(pageChirho)).find(
			(audioChirho) => audioChirho.url_chirho === PART_TWO_CHIRHO
		)!.seconds_chirho
	).toBeCloseTo(2, 0);
	await pageChirho.reload();
	await expect(
		pageChirho.getByRole('button', { name: 'Play Scripture', exact: true })
	).toBeEnabled();
	const requestedChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		if (requestChirho.url().endsWith('.mp3')) requestedChirho.push(requestChirho.url());
	});
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await waitForPartChirho(pageChirho, PART_TWO_CHIRHO, true);
	expect(requestedChirho).not.toContain(PART_ONE_CHIRHO);
	await pageChirho.getByRole('button', { name: 'Pause Scripture', exact: true }).click();
	await seekChapterChirho(pageChirho, 1);
	await waitForPartChirho(pageChirho, PART_ONE_CHIRHO, false);
	expect(
		(await mediaStateChirho(pageChirho)).find(
			(audioChirho) => audioChirho.url_chirho === PART_ONE_CHIRHO
		)!.seconds_chirho
	).toBeCloseTo(1, 0);
});

test('a later-file network failure preserves the chapter and boundary for retry', async ({
	page: pageChirho
}) => {
	await pageChirho.route(PART_TWO_CHIRHO, (routeChirho) => routeChirho.abort('failed'));
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await waitForPartChirho(pageChirho, PART_ONE_CHIRHO, true);
	await endActivePartChirho(pageChirho);
	await expect(
		pageChirho.getByRole('button', { name: 'Play Scripture', exact: true })
	).toBeEnabled();
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('2');
	const savedChirho = await pageChirho.evaluate(
		(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
		PREFERENCES_KEY_CHIRHO
	);
	expect(savedChirho).toMatchObject({
		chapter_chirho: 2,
		seconds_chirho: 3,
		followed_place_chirho: { chapter_chirho: 2, seconds_chirho: 3 }
	});
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect(
		pageChirho.getByRole('button', { name: 'Play Scripture', exact: true })
	).toBeEnabled();
	expect(
		await pageChirho.evaluate(
			(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!).seconds_chirho,
			PREFERENCES_KEY_CHIRHO
		)
	).toBe(3);
});
