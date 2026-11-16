// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileChirho } from 'node:fs';
import { test, expect, type Page as PageChirho } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho,
	mediaEventsChirho
} from './helpers-chirho/media_chirho';
import {
	observeMediaSessionChirho,
	mediaSessionStateChirho,
	invokeMediaActionChirho
} from './helpers-chirho/media_session_chirho';

test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
	await observeMediaSessionChirho(pageChirho);
	await pageChirho.addInitScript(() =>
		localStorage.setItem('audio-bible-radio-view-chirho', 'simple')
	);
	await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
		routeChirho.fulfill({ status: 404, body: '' })
	);
	await pageChirho.route('https://**/*.mp3', (routeChirho) =>
		routeChirho.fulfill({
			contentType: 'audio/wav',
			body: fixtureWaveChirho(30),
			headers: { 'accept-ranges': 'bytes' }
		})
	);
});

test.afterEach(async ({ page: pageChirho }, infoChirho) => {
	if (infoChirho.status !== infoChirho.expectedStatus && !pageChirho.isClosed())
		await infoChirho.attach('media_control_events_chirho', {
			body: JSON.stringify(
				{
					session_chirho: await mediaSessionStateChirho(pageChirho),
					events_chirho: await mediaEventsChirho(pageChirho)
				},
				null,
				2
			),
			contentType: 'application/json'
		});
});

async function openChirho(pageChirho: PageChirho, pathChirho = '/'): Promise<void> {
	await pageChirho.goto(pathChirho);
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
}

async function sourceChirho(pageChirho: PageChirho) {
	return (await mediaStateChirho(pageChirho)).find(
		(audioChirho) =>
			audioChirho.url_chirho.startsWith('https://') &&
			!audioChirho.url_chirho.includes('/sounds-chirho/')
	);
}

async function playingChirho(pageChirho: PageChirho): Promise<void> {
	await expect
		.poll(async () => {
			const audioChirho = await sourceChirho(pageChirho);
			return !!audioChirho && !audioChirho.paused_chirho && audioChirho.seconds_chirho > 0;
		})
		.toBe(true);
}

async function effectPlaysChirho(pageChirho: PageChirho): Promise<number> {
	return (await mediaEventsChirho(pageChirho)).filter(
		(eventChirho) =>
			eventChirho.kind_chirho === 'play_call_chirho' &&
			eventChirho.requested_url_chirho?.includes('/sounds-chirho/')
	).length;
}

test('an unopened radio and quiet widget do not claim platform controls or metadata', async ({
	page: pageChirho
}) => {
	for (const pathChirho of ['/', '/embed-chirho']) {
		await openChirho(pageChirho, pathChirho);
		const sessionChirho = await mediaSessionStateChirho(pageChirho);
		expect(sessionChirho.metadata_chirho).toBeNull();
		expect(sessionChirho.actions_chirho).toEqual([]);
		expect(sessionChirho.position_chirho).toBeNull();
		expect(
			(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
		).toBe(true);
	}
});

test('platform power, chapter and seek handlers control one stream quietly and retain Off', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).actions_chirho)
		.toContain('seekto');
	const effectCountChirho = await effectPlaysChirho(pageChirho);
	expect(effectCountChirho).toBeGreaterThan(0);
	const firstChirho = await sourceChirho(pageChirho);
	await invokeMediaActionChirho(pageChirho, 'pause');
	expect(
		(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
	expect((await mediaSessionStateChirho(pageChirho)).playback_chirho).toBe('paused');
	expect(await effectPlaysChirho(pageChirho)).toBe(effectCountChirho);
	await invokeMediaActionChirho(pageChirho, 'play');
	await playingChirho(pageChirho);
	expect((await sourceChirho(pageChirho))?.url_chirho).toBe(firstChirho?.url_chirho);
	await invokeMediaActionChirho(pageChirho, 'seekto', { seekTime: 12 });
	await expect
		.poll(async () => (await sourceChirho(pageChirho))?.seconds_chirho)
		.toBeGreaterThanOrEqual(12);
	await invokeMediaActionChirho(pageChirho, 'seekbackward', { seekOffset: 4 });
	await expect.poll(async () => (await sourceChirho(pageChirho))?.seconds_chirho).toBeLessThan(10);
	await invokeMediaActionChirho(pageChirho, 'seekforward');
	await expect
		.poll(async () => (await sourceChirho(pageChirho))?.seconds_chirho)
		.toBeGreaterThan(17);
	await invokeMediaActionChirho(pageChirho, 'nexttrack');
	await playingChirho(pageChirho);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('2');
	await invokeMediaActionChirho(pageChirho, 'previoustrack');
	await playingChirho(pageChirho);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('1');
	expect(await effectPlaysChirho(pageChirho)).toBe(effectCountChirho);
	await invokeMediaActionChirho(pageChirho, 'stop');
	await expect(
		pageChirho.getByRole('button', { name: 'Radio power', exact: true })
	).toHaveAttribute('aria-pressed', 'false');
	await pageChirho.reload();
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
	expect(
		(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
	expect((await mediaSessionStateChirho(pageChirho)).metadata_chirho).toBeNull();
});

test('platform state returns to playing after an on-radio effect finishes', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () => (await sourceChirho(pageChirho))?.seconds_chirho)
		.toBeGreaterThan(1.5);
	const sequenceChirho = (await mediaEventsChirho(pageChirho)).at(-1)?.sequence_chirho ?? 0;
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaEventsChirho(pageChirho)).some(
				(eventChirho) =>
					eventChirho.sequence_chirho > sequenceChirho &&
					eventChirho.kind_chirho === 'ended' &&
					eventChirho.ended_chirho &&
					eventChirho.url_chirho.includes('/interface-chirho/')
			)
		)
		.toBe(true);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).playback_chirho)
		.toBe('playing');
	expect((await sourceChirho(pageChirho))?.paused_chirho).toBe(false);
});

test('platform seeking crosses split files using the whole chapter timeline and preserves a paused seek', async ({
	page: pageChirho
}) => {
	const frenchChirho = JSON.parse(
		readFileChirho('static/catalogue-chirho/languages-chirho/f/fr.json', 'utf8')
	);
	const stationChirho = frenchChirho.stations_chirho[0];
	const partsChirho = stationChirho.composite_chapters_chirho.JOL['2'].parts_chirho as {
		url_chirho: string;
		duration_seconds_chirho: number;
	}[];
	partsChirho[0].duration_seconds_chirho = 12;
	partsChirho[1].duration_seconds_chirho = 18;
	await pageChirho.route('**/catalogue-chirho/languages-chirho/f/fr.json', (routeChirho) =>
		routeChirho.fulfill({ json: frenchChirho })
	);
	for (const partChirho of partsChirho)
		await pageChirho.route(partChirho.url_chirho, (routeChirho) =>
			routeChirho.fulfill({
				contentType: 'audio/wav',
				body: fixtureWaveChirho(partChirho.duration_seconds_chirho),
				headers: { 'accept-ranges': 'bytes' }
			})
		);
	await pageChirho.addInitScript(
		(stationIdChirho) =>
			localStorage.setItem(
				'audio-bible-radio-preferences-chirho',
				JSON.stringify({
					station_id_chirho: stationIdChirho,
					language_code_chirho: 'fr',
					book_id_chirho: 'JOL',
					chapter_chirho: 2,
					seconds_chirho: 0,
					sounds_enabled_chirho: false
				})
			),
		stationChirho.id_chirho
	);
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).position_chirho?.duration)
		.toBe(30);
	await pageChirho.evaluate(() => {
		const traceChirho = window as unknown as {
			audioElementsChirho: HTMLAudioElement[];
			firstMediaControlAudioChirho?: HTMLAudioElement;
		};
		traceChirho.firstMediaControlAudioChirho = traceChirho.audioElementsChirho.find((audioChirho) =>
			audioChirho.currentSrc.startsWith('https://')
		);
	});
	await invokeMediaActionChirho(pageChirho, 'seekto', { seekTime: 17 });
	await playingChirho(pageChirho);
	await expect
		.poll(async () => (await sourceChirho(pageChirho))?.url_chirho)
		.toBe(partsChirho[1].url_chirho);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).position_chirho?.position)
		.toBeGreaterThanOrEqual(17);
	expect((await mediaSessionStateChirho(pageChirho)).position_chirho?.duration).toBe(30);
	expect((await sourceChirho(pageChirho))?.seconds_chirho).toBeLessThan(8);
	expect(
		await pageChirho.evaluate((urlChirho) => {
			const audioChirho = (window as unknown as { firstMediaControlAudioChirho: HTMLAudioElement })
				.firstMediaControlAudioChirho;
			return audioChirho.currentSrc === urlChirho && !audioChirho.paused;
		}, partsChirho[1].url_chirho)
	).toBe(true);
	await invokeMediaActionChirho(pageChirho, 'pause');
	await invokeMediaActionChirho(pageChirho, 'seekto', { seekTime: 6 });
	await expect
		.poll(async () => (await sourceChirho(pageChirho))?.url_chirho)
		.toBe(partsChirho[0].url_chirho);
	expect((await sourceChirho(pageChirho))?.paused_chirho).toBe(true);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).position_chirho?.position)
		.toBe(6);
	expect((await mediaSessionStateChirho(pageChirho)).playback_chirho).toBe('paused');
	expect(
		await pageChirho.evaluate(() => {
			const traceChirho = window as unknown as {
				audioElementsChirho: HTMLAudioElement[];
				firstMediaControlAudioChirho: HTMLAudioElement;
			};
			return (
				traceChirho.audioElementsChirho.includes(traceChirho.firstMediaControlAudioChirho) &&
				traceChirho.firstMediaControlAudioChirho.currentSrc.startsWith('https://')
			);
		})
	).toBe(true);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('2');
});

test('leaving the receiver retires platform metadata and registered callbacks', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).metadata_chirho)
		.not.toBeNull();
	await pageChirho.evaluate(() => Object.assign(window, { mediaDocumentChirho: 'receiver' }));
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await pageChirho.getByRole('link', { name: 'Recording credits', exact: true }).click();
	await expect(pageChirho).toHaveURL(/\/credits-chirho$/);
	expect(
		await pageChirho.evaluate(
			() => (window as unknown as { mediaDocumentChirho: string }).mediaDocumentChirho
		)
	).toBe('receiver');
	await expect
		.poll(async () => (await mediaSessionStateChirho(pageChirho)).actions_chirho)
		.toEqual([]);
	expect((await mediaSessionStateChirho(pageChirho)).metadata_chirho).toBeNull();
	expect((await mediaSessionStateChirho(pageChirho)).position_chirho).toBeNull();
	expect((await mediaSessionStateChirho(pageChirho)).playback_chirho).toBe('none');
	expect(
		(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
});

test('an unavailable platform API leaves ordinary radio playback usable', async ({
	page: pageChirho
}) => {
	await pageChirho.addInitScript(() =>
		Object.defineProperty(navigator, 'mediaSession', { configurable: true, value: undefined })
	);
	const errorsChirho: string[] = [];
	pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	expect((await sourceChirho(pageChirho))?.paused_chirho).toBe(true);
	expect(errorsChirho).toEqual([]);
});

test('a platform retry after a stream error stays quiet instead of starting a tuning cue', async ({
	page: pageChirho
}) => {
	let failChirho = false;
	await pageChirho.route('https://**/*.mp3', (routeChirho) =>
		failChirho
			? routeChirho.fulfill({ status: 503, body: '' })
			: routeChirho.fulfill({
					contentType: 'audio/wav',
					body: fixtureWaveChirho(30),
					headers: { 'accept-ranges': 'bytes' }
				})
	);
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	const countChirho = await effectPlaysChirho(pageChirho);
	failChirho = true;
	await invokeMediaActionChirho(pageChirho, 'nexttrack');
	await expect(
		pageChirho.getByRole('button', { name: 'Radio power', exact: true })
	).toHaveAttribute('aria-pressed', 'false');
	expect((await mediaSessionStateChirho(pageChirho)).playback_chirho).toBe('paused');
	failChirho = false;
	await invokeMediaActionChirho(pageChirho, 'play');
	await playingChirho(pageChirho);
	expect(await effectPlaysChirho(pageChirho)).toBe(countChirho);
});
