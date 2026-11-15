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
async function chooseLanguageChirho(pageChirho: Page, codeChirho: string): Promise<void> {
	await pageChirho
		.getByRole('combobox', { name: 'Language', exact: true })
		.selectOption(codeChirho);
}
async function chooseHindiRecordingChirho(pageChirho: Page): Promise<void> {
	await chooseLanguageChirho(pageChirho, 'hi');
	await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
		'hi'
	);
	await pageChirho
		.getByRole('combobox', { name: 'Version', exact: true })
		.selectOption({ label: hindiStationChirho.version_chirho });
	await pageChirho
		.getByRole('combobox', { name: 'Narration', exact: true })
		.selectOption(hindiStationChirho.id_chirho);
}
function savedHindiChirho() {
	return {
		station_id_chirho: hindiStationChirho.id_chirho,
		language_code_chirho: 'hi',
		dial_language_chirho: 'hi',
		book_id_chirho: 'JHN',
		chapter_chirho: 3,
		seconds_chirho: 7,
		sounds_enabled_chirho: false
	};
}
async function seedChirho(
	pageChirho: Page,
	valueChirho: ReturnType<typeof savedHindiChirho>
): Promise<void> {
	await pageChirho.addInitScript(
		({ key_chirho: keyChirho, value_chirho: valueChirho }) =>
			localStorage.setItem(keyChirho, JSON.stringify(valueChirho)),
		{ key_chirho: PREFERENCES_KEY_CHIRHO, value_chirho: valueChirho }
	);
}
test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
	await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
		routeChirho.fulfill({
			json: { verses: [0, 3, 6, 9, 12] },
			headers: { 'access-control-allow-origin': '*' }
		})
	);
	await pageChirho.route('https://**/*.mp3', (routeChirho) =>
		routeChirho.fulfill({
			status: 200,
			contentType: 'audio/wav',
			body: fixtureWaveChirho(),
			headers: { 'accept-ranges': 'bytes' }
		})
	);
});

test('integrated language, version and narration labels fit a narrow screen and show the loaded credit', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 320, height: 844 });
	await pageChirho.goto('/');
	await chooseHindiRecordingChirho(pageChirho);
	await expect(
		pageChirho
			.locator('.credit-chirho')
			.getByText(hindiStationChirho.credit_chirho, { exact: true })
	).toBeVisible();
	expect(await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
		true
	);
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await pageChirho.keyboard.press('Escape');
	await expect(
		pageChirho.getByRole('button', { name: 'About and settings', exact: true })
	).toBeFocused();
});

test('English starts while the language index is held; a later language preserves position and reopens', async ({
	page: pageChirho
}) => {
	let releaseChirho!: () => void;
	const heldChirho = new Promise<void>((resolveChirho) => {
		releaseChirho = resolveChirho;
	});
	await pageChirho.route('**/catalogue-chirho/languages_chirho.json', async (routeChirho) => {
		await heldChirho;
		await routeChirho.continue();
	});
	try {
		await pageChirho.goto('/');
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
		await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
		await pageChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
		const seekChirho = pageChirho.getByRole('slider', { name: 'Chapter position', exact: true });
		await expect(seekChirho).toBeEnabled();
		await seekChirho.fill('6');
		releaseChirho();
		await chooseHindiRecordingChirho(pageChirho);
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
		await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue(
			'3'
		);
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
		const savedChirho = await pageChirho.evaluate(
			(keyChirho) => JSON.parse(localStorage.getItem(keyChirho)!),
			PREFERENCES_KEY_CHIRHO
		);
		expect(savedChirho).toMatchObject({
			station_id_chirho: hindiStationChirho.id_chirho,
			language_code_chirho: 'hi',
			chapter_chirho: 3
		});
		await pageChirho.reload();
		await expect(pageChirho.getByRole('combobox', { name: 'Narration', exact: true })).toHaveValue(
			hindiStationChirho.id_chirho
		);
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
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
			(await mediaStateChirho(pageChirho)).filter((audioChirho) => !audioChirho.paused_chirho)
		).toHaveLength(1);
	} finally {
		releaseChirho();
	}
});

test('a failed language selection leaves playback intact and can be chosen again to retry', async ({
	page: pageChirho
}) => {
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.abort('internetdisconnected')
	);
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	await chooseLanguageChirho(pageChirho, 'hi');
	await expect(pageChirho.getByText(/These stations could not load/)).toBeVisible();
	await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
		'en'
	);
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	expect(
		(await mediaStateChirho(pageChirho)).some(
			(audioChirho) => audioChirho.url_chirho.startsWith('https://') && !audioChirho.paused_chirho
		)
	).toBe(true);
	await pageChirho.unroute('**/catalogue-chirho/languages-chirho/h/hi.json');
	await chooseHindiRecordingChirho(pageChirho);
	await expect(pageChirho.getByRole('combobox', { name: 'Narration', exact: true })).toHaveValue(
		hindiStationChirho.id_chirho
	);
});

test('a failed restore never overwrites the remembered recording and retries at its saved seconds', async ({
	page: pageChirho
}) => {
	const savedChirho = savedHindiChirho();
	await seedChirho(pageChirho, savedChirho);
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.fulfill({ status: 503, body: 'Unavailable' })
	);
	await pageChirho.goto('/');
	await expect(
		pageChirho.getByRole('button', { name: 'Retry saved station', exact: true })
	).toBeVisible();
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeDisabled();
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
	await expect(pageChirho.getByRole('combobox', { name: 'Narration', exact: true })).toHaveValue(
		hindiStationChirho.id_chirho
	);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
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

test('a built-in recording remains reachable when a saved dynamic station cannot restore', async ({
	page: pageChirho
}) => {
	await seedChirho(pageChirho, {
		...savedHindiChirho(),
		station_id_chirho: 'davar-missing-station'
	});
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.fulfill({ status: 503, body: 'Unavailable' })
	);
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Use built-in stations', exact: true }).click();
	await pageChirho
		.getByRole('combobox', { name: 'Narration', exact: true })
		.selectOption('helloao-bsb-hays');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) => audioChirho.url_chirho.includes('/hays.mp3') && !audioChirho.paused_chirho
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
	try {
		await pageChirho.goto('/');
		await chooseLanguageChirho(pageChirho, 'hi');
		await chooseLanguageChirho(pageChirho, 'sw');
		await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
			'sw'
		);
		releaseChirho();
		await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
		await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
		await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
			'sw'
		);
	} finally {
		releaseChirho();
	}
});

test('a failed selection during restoration exposes retry and preserves the saved station', async ({
	page: pageChirho
}) => {
	const savedChirho = savedHindiChirho();
	await seedChirho(pageChirho, savedChirho);
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
		await chooseLanguageChirho(pageChirho, 'sw');
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
		await expect(pageChirho.getByRole('combobox', { name: 'Narration', exact: true })).toHaveValue(
			hindiStationChirho.id_chirho
		);
	} finally {
		releaseChirho();
	}
});
