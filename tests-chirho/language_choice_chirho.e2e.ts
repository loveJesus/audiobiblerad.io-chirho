// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import {
	fixtureWaveChirho,
	mediaStateChirho,
	observeMediaChirho
} from './helpers-chirho/media_chirho';

const PREFERENCES_KEY_CHIRHO = 'audio-bible-radio-preferences-chirho';
const hindiFileChirho = JSON.parse(
	readFileSync('static/catalogue-chirho/languages-chirho/h/hi.json', 'utf8')
);
const hindiStationChirho = hindiFileChirho.stations_chirho[0] as {
	id_chirho: string;
	credit_chirho: string;
	version_chirho: string;
};

test('a built-in recording can be chosen directly when a saved dynamic station cannot restore', async ({
	page: pageChirho
}) => {
	await pageChirho.addInitScript(
		(keyChirho) =>
			localStorage.setItem(
				keyChirho,
				JSON.stringify({
					station_id_chirho: 'davar-missing-station',
					language_code_chirho: 'hi',
					book_id_chirho: 'JHN',
					chapter_chirho: 3,
					seconds_chirho: 5,
					sounds_enabled_chirho: false
				})
			),
		PREFERENCES_KEY_CHIRHO
	);
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.fulfill({ status: 503, body: 'Unavailable' })
	);
	await pageChirho.goto('/');
	await expect(
		pageChirho.getByRole('button', { name: 'Retry saved station', exact: true })
	).toBeVisible();
	await browseChirho(pageChirho, 'Hays');
	await pageChirho
		.getByRole('group', { name: 'Recordings', exact: true })
		.getByRole('button')
		.filter({ hasText: 'Hays' })
		.click();
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	expect(
		(await mediaStateChirho(pageChirho)).some(
			(audioChirho) => audioChirho.url_chirho.includes('/hays.mp3') && !audioChirho.paused_chirho
		)
	).toBe(true);
});

async function browseChirho(pageChirho: Page, searchChirho: string): Promise<void> {
	await pageChirho.getByRole('button', { name: /Browse stations/ }).click();
	await pageChirho.getByRole('searchbox').fill(searchChirho);
}

async function chooseLanguageChirho(pageChirho: Page, nameChirho: string): Promise<void> {
	await pageChirho
		.getByRole('group', { name: 'Languages', exact: true })
		.getByRole('button')
		.filter({ has: pageChirho.getByText(nameChirho, { exact: true }) })
		.click();
}

test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
	await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
		routeChirho.fulfill({
			json: { verses: [0, 3, 6, 9, 12] },
			headers: { 'access-control-allow-origin': '*' }
		})
	);
	const bytesChirho = fixtureWaveChirho();
	await pageChirho.route('https://**/*.mp3', (routeChirho) =>
		routeChirho.fulfill({
			status: 200,
			contentType: 'audio/wav',
			body: bytesChirho,
			headers: { 'accept-ranges': 'bytes' }
		})
	);
});

test('the language picker supports keyboard return and fits a narrow screen with a loaded recording', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 320, height: 844 });
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: /Browse stations/ }).click();
	await expect(pageChirho.getByRole('searchbox')).toBeFocused();
	await pageChirho.getByRole('searchbox').fill('Hindi');
	await chooseLanguageChirho(pageChirho, 'Hindi');
	await pageChirho
		.getByRole('group', { name: 'Recordings', exact: true })
		.getByRole('button')
		.filter({ hasText: hindiStationChirho.version_chirho })
		.click();
	expect(await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
		true
	);
	await pageChirho.getByRole('button', { name: 'Back to radio ↑', exact: true }).click();
	await expect(pageChirho.getByRole('button', { name: /Browse stations/ })).toBeFocused();
	await expect(pageChirho.getByRole('region', { name: 'All stations', exact: true })).toHaveCount(
		0
	);
	await expect(
		pageChirho.getByText(hindiStationChirho.credit_chirho, { exact: true })
	).toBeVisible();
});

test('first sound needs no language data; an explicit language merges stations, preserves position and reopens', async ({
	page: pageChirho
}) => {
	const catalogueRequestsChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		if (requestChirho.url().includes('/catalogue-chirho/'))
			catalogueRequestsChirho.push(requestChirho.url());
	});
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	await pageChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) => !audioChirho.paused_chirho && audioChirho.seconds_chirho > 0.1
			)
		)
		.toBe(true);
	expect(catalogueRequestsChirho).toEqual([]);
	await pageChirho.getByRole('slider', { name: 'Chapter position', exact: true }).fill('6');
	await browseChirho(pageChirho, 'हिन्दी');
	await chooseLanguageChirho(pageChirho, 'हिन्दी');
	const recordingsChirho = pageChirho.getByRole('group', { name: 'Recordings', exact: true });
	await expect(recordingsChirho.getByRole('button')).toHaveCount(
		hindiFileChirho.stations_chirho.length + 1
	);
	await recordingsChirho
		.getByRole('button')
		.filter({ hasText: hindiStationChirho.version_chirho })
		.click();
	await expect(
		pageChirho.getByText(hindiStationChirho.credit_chirho, { exact: true })
	).toBeVisible();
	await expect(pageChirho.getByText(/chapters listed by the publisher/)).toBeVisible();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://audio.dbs.org/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho >= 5
			)
		)
		.toBe(true);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('3');
	await pageChirho.getByRole('button', { name: 'Pause Scripture', exact: true }).click();
	const savedChirho = await pageChirho.evaluate(
		(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
		PREFERENCES_KEY_CHIRHO
	);
	expect(savedChirho).toMatchObject({
		station_id_chirho: hindiStationChirho.id_chirho,
		language_code_chirho: 'hi',
		dial_language_chirho: 'hi',
		chapter_chirho: 3
	});
	await pageChirho.reload();
	await expect(
		pageChirho.getByText(hindiStationChirho.credit_chirho, { exact: true })
	).toBeVisible();
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://audio.dbs.org/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho >= savedChirho.seconds_chirho - 0.5
			)
		)
		.toBe(true);
	expect(
		catalogueRequestsChirho.every(
			(urlChirho) =>
				urlChirho.endsWith('/languages_chirho.json') || urlChirho.endsWith('/h/hi.json')
		)
	).toBe(true);
	expect(
		(await mediaStateChirho(pageChirho)).filter((audioChirho) => !audioChirho.paused_chirho)
	).toHaveLength(1);
});

test('a failed language load leaves current playback and saved place intact, then retries', async ({
	page: pageChirho
}) => {
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.abort('internetdisconnected')
	);
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	await browseChirho(pageChirho, 'Hindi');
	await chooseLanguageChirho(pageChirho, 'Hindi');
	await expect(pageChirho.getByText(/These stations could not load/)).toBeVisible();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	expect(
		(await mediaStateChirho(pageChirho)).some(
			(audioChirho) => audioChirho.url_chirho.includes('/hays.mp3') && !audioChirho.paused_chirho
		)
	).toBe(true);
	await pageChirho.unroute('**/catalogue-chirho/languages-chirho/h/hi.json');
	await chooseLanguageChirho(pageChirho, 'Hindi');
	await expect(
		pageChirho.getByRole('group', { name: 'Recordings', exact: true }).getByRole('button')
	).toHaveCount(4);
});

test('a failed restore never overwrites the remembered recording, and retry restores its seconds', async ({
	page: pageChirho
}) => {
	const savedChirho = {
		station_id_chirho: hindiStationChirho.id_chirho,
		language_code_chirho: 'hi',
		dial_language_chirho: 'hi',
		book_id_chirho: 'JHN',
		chapter_chirho: 3,
		seconds_chirho: 7,
		sounds_enabled_chirho: false
	};
	await pageChirho.addInitScript(
		({ key_chirho: keyChirho, value_chirho: valueChirho }) =>
			localStorage.setItem(keyChirho, JSON.stringify(valueChirho)),
		{ key_chirho: PREFERENCES_KEY_CHIRHO, value_chirho: savedChirho }
	);
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.fulfill({ status: 503, body: 'Unavailable' })
	);
	await pageChirho.goto('/');
	await expect(
		pageChirho.getByText('Your saved station could not load. Your place is kept.')
	).toBeVisible();
	await expect(
		pageChirho.getByRole('button', { name: 'Play Scripture', exact: true })
	).toBeDisabled();
	expect(
		await pageChirho.evaluate(
			(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
			PREFERENCES_KEY_CHIRHO
		)
	).toEqual(savedChirho);
	await pageChirho.reload();
	await expect(
		pageChirho.getByRole('button', { name: 'Retry saved station', exact: true })
	).toBeVisible();
	expect(
		await pageChirho.evaluate(
			(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
			PREFERENCES_KEY_CHIRHO
		)
	).toEqual(savedChirho);
	await pageChirho.unroute('**/catalogue-chirho/languages-chirho/h/hi.json');
	await pageChirho.getByRole('button', { name: 'Retry saved station', exact: true }).click();
	await expect(
		pageChirho.getByText(hindiStationChirho.credit_chirho, { exact: true })
	).toBeVisible();
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://audio.dbs.org/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho >= 7
			)
		)
		.toBe(true);
});

test('a late language response cannot change a newer selection', async ({ page: pageChirho }) => {
	let releaseChirho!: () => void;
	const heldChirho = new Promise<void>((resolveChirho) => {
		releaseChirho = resolveChirho;
	});
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', async (routeChirho) => {
		await heldChirho;
		await routeChirho.fulfill({ json: hindiFileChirho });
	});
	await pageChirho.goto('/');
	await browseChirho(pageChirho, 'Hindi');
	await chooseLanguageChirho(pageChirho, 'Hindi');
	await pageChirho.getByRole('searchbox').fill('Swahili');
	await chooseLanguageChirho(pageChirho, 'Swahili');
	await expect(
		pageChirho.getByRole('group', { name: 'Recordings', exact: true }).getByRole('button').first()
	).toContainText('Swahili');
	releaseChirho();
	await pageChirho.getByRole('button', { name: 'Play Scripture', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	await expect(pageChirho.locator('.station-language-chirho')).toHaveAttribute('lang', 'sw');
	await pageChirho.getByRole('button', { name: 'All built-in stations', exact: true }).click();
	await expect(
		pageChirho.getByRole('slider', { name: 'Station dial', exact: true })
	).toHaveAttribute('max', '28');
});

test('a failed selection during restoration exposes retry and preserves the saved station', async ({
	page: pageChirho
}) => {
	const savedChirho = {
		station_id_chirho: hindiStationChirho.id_chirho,
		language_code_chirho: 'hi',
		dial_language_chirho: 'hi',
		book_id_chirho: 'JHN',
		chapter_chirho: 3,
		seconds_chirho: 7,
		sounds_enabled_chirho: false
	};
	await pageChirho.addInitScript(
		({ key_chirho: keyChirho, value_chirho: valueChirho }) =>
			localStorage.setItem(keyChirho, JSON.stringify(valueChirho)),
		{ key_chirho: PREFERENCES_KEY_CHIRHO, value_chirho: savedChirho }
	);
	let releaseChirho!: () => void;
	const heldChirho = new Promise<void>((resolveChirho) => {
		releaseChirho = resolveChirho;
	});
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', async (routeChirho) => {
		await heldChirho;
		await routeChirho.fulfill({ json: hindiFileChirho });
	});
	await pageChirho.route('**/catalogue-chirho/languages-chirho/s/sw.json', (routeChirho) =>
		routeChirho.fulfill({ status: 503, body: 'Unavailable' })
	);
	try {
		await pageChirho.goto('/');
		await expect(pageChirho.getByText('Restoring your station…', { exact: false })).toBeVisible();
		await browseChirho(pageChirho, 'Swahili');
		await chooseLanguageChirho(pageChirho, 'Swahili');
		await expect(
			pageChirho.getByRole('button', { name: 'Retry saved station', exact: true })
		).toBeVisible();
		await expect(pageChirho.getByText('Restoring your station…', { exact: false })).toHaveCount(0);
		expect(
			await pageChirho.evaluate(
				(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
				PREFERENCES_KEY_CHIRHO
			)
		).toEqual(savedChirho);
		await pageChirho.unroute('**/catalogue-chirho/languages-chirho/h/hi.json');
		await pageChirho.getByRole('button', { name: 'Retry saved station', exact: true }).click();
		await expect(
			pageChirho.getByText(hindiStationChirho.credit_chirho, { exact: true })
		).toBeVisible();
	} finally {
		releaseChirho();
	}
});
