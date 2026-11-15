// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, test } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho
} from './helpers-chirho/media_chirho';

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

test('the built worker serves the shared catalogue and a credit for every cleared station', async ({
	page: pageChirho
}) => {
	const responseChirho = await pageChirho.request.get('/catalogue-chirho');
	expect(responseChirho.ok()).toBe(true);
	expect(responseChirho.headers()['content-type']).toContain('application/json');
	expect(responseChirho.headers()['access-control-allow-origin']).toBe('*');
	const catalogueChirho = (await responseChirho.json()) as {
		contract_version_chirho: number;
		books_chirho: unknown[];
		stations_chirho: Array<{ id_chirho: string; credit_chirho: string }>;
	};
	expect(catalogueChirho.contract_version_chirho).toBeGreaterThan(0);
	expect(catalogueChirho.books_chirho.length).toBeGreaterThan(0);
	expect(catalogueChirho.stations_chirho.length).toBeGreaterThan(0);
	await pageChirho.goto('/credits-chirho');
	for (const stationChirho of catalogueChirho.stations_chirho)
		await expect(pageChirho.getByText(stationChirho.credit_chirho, { exact: true })).toBeVisible();
});

test('one tap decodes audio, tuning keeps the passage, effects stop, and preferences survive reopening', async ({
	page: pageChirho
}) => {
	const requestedChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		if (requestChirho.url().endsWith('.mp3')) requestedChirho.push(requestChirho.url());
	});
	await pageChirho.goto('/');
	expect(requestedChirho).toHaveLength(0);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
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
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await expect(pageChirho.getByText('Playback timing', { exact: true })).toBeVisible();
	await pageChirho.getByRole('button', { name: 'Close about', exact: true }).click();
	const playingChirho = (await mediaStateChirho(pageChirho)).filter(
		(audioChirho) => !audioChirho.paused_chirho
	);
	expect(playingChirho).toHaveLength(1);
	expect(playingChirho[0]).toMatchObject({ muted_chirho: false, volume_chirho: 1 });
	await pageChirho.getByRole('button', { name: 'Next station', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					audioChirho.url_chirho !== playingChirho[0].url_chirho &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 0.1
			)
		)
		.toBe(true);
	const targetUrlChirho = (await mediaStateChirho(pageChirho)).find(
		(audioChirho) => !audioChirho.paused_chirho && audioChirho.url_chirho.startsWith('https://')
	)!.url_chirho;
	await expect(pageChirho.getByRole('combobox', { name: 'Book', exact: true })).toHaveValue('43');
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('1');
	await pageChirho.getByRole('checkbox', { name: 'Radio sounds', exact: true }).uncheck();
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const requestsBeforeReloadChirho = requestedChirho.length;
	await pageChirho.reload();
	await expect(
		pageChirho.getByRole('checkbox', { name: 'Radio sounds', exact: true })
	).not.toBeChecked();
	expect(requestedChirho.length).toBe(requestsBeforeReloadChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) => audioChirho.url_chirho === targetUrlChirho && !audioChirho.paused_chirho
			)
		)
		.toBe(true);
});

test('the first play control waits for its handler when JavaScript arrives late', async ({
	page: pageChirho
}) => {
	let releaseChirho: () => void = () => {
		throw new Error('Missing asset gate');
	};
	const gateChirho = new Promise<void>((resolveChirho) => {
		releaseChirho = resolveChirho;
	});
	await pageChirho.route('**/_app/**/*.js', async (routeChirho) => {
		await gateChirho;
		await routeChirho.continue();
	});
	try {
		await pageChirho.goto('/', { waitUntil: 'domcontentloaded' });
		const playChirho = pageChirho.getByRole('button', { name: 'Radio power', exact: true });
		await expect(playChirho).toBeDisabled();
		releaseChirho();
		await playChirho.click();
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

test('a station with partial coverage lands on an available book before the first tap', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho
		.getByRole('combobox', { name: 'Book', exact: true })
		.selectOption({ label: 'Genesis' });
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('ne');
	await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
		'ne'
	);
	await pageChirho
		.getByRole('combobox', { name: 'Version', exact: true })
		.selectOption({ label: 'Unlocked Literal Bible' });
	await expect(pageChirho.getByRole('combobox', { name: 'Book', exact: true })).not.toHaveValue(
		'1'
	);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.includes('/ne/ulb/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 0.1
			)
		)
		.toBe(true);
});

test('a naturally ended chapter starts the next available chapter', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const seekChirho = pageChirho.getByRole('slider', { name: 'Chapter position', exact: true });
	await expect(seekChirho).toBeEnabled();
	await seekChirho.press('End');
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue(
		'2',
		{
			timeout: 10000
		}
	);
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) => !audioChirho.paused_chirho && audioChirho.url_chirho.includes('/JHN/2/')
			)
		)
		.toBe(true);
});

test('turning through a partial station returns to the original passage and place', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const seekChirho = pageChirho.getByRole('slider', { name: 'Chapter position', exact: true });
	await expect(seekChirho).toBeEnabled();
	await seekChirho.press('PageUp');
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('mi');
	await expect(pageChirho.getByRole('combobox', { name: 'Book', exact: true })).not.toHaveValue(
		'43'
	);
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('en');
	await expect(pageChirho.getByRole('combobox', { name: 'Book', exact: true })).toHaveValue('43');
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('3');
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.includes('/JHN/3/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 1
			)
		)
		.toBe(true);
});

test('network failure preserves a saved passage and an explicit retry resumes it after recovery', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const seekChirho = pageChirho.getByRole('slider', { name: 'Chapter position', exact: true });
	await expect(seekChirho).toBeEnabled();
	await seekChirho.press('PageUp');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const beforeChirho = await pageChirho.evaluate(
		() =>
			JSON.parse(localStorage.getItem('audio-bible-radio-preferences-chirho')!) as {
				chapter_chirho: number;
				seconds_chirho: number;
			}
	);
	let failuresChirho = 0;
	const abortChirho = (routeChirho: import('@playwright/test').Route) => {
		failuresChirho += 1;
		return routeChirho.abort('connectionrefused');
	};
	await pageChirho.route('https://**/*.mp3', abortChirho);
	await pageChirho.reload();
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect.poll(() => failuresChirho).toBe(4);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('3');
	const afterChirho = await pageChirho.evaluate(
		() =>
			JSON.parse(localStorage.getItem('audio-bible-radio-preferences-chirho')!) as {
				chapter_chirho: number;
				seconds_chirho: number;
			}
	);
	expect(afterChirho).toMatchObject({
		chapter_chirho: 3,
		seconds_chirho: beforeChirho.seconds_chirho
	});
	await pageChirho.unroute('https://**/*.mp3', abortChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.includes('/JHN/3/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho >= beforeChirho.seconds_chirho
			)
		)
		.toBe(true);
});

test('dragging the seek thumb keeps its preview while the recording clock advances', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const seekChirho = pageChirho.getByRole('slider', { name: 'Chapter position', exact: true });
	await expect(seekChirho).toBeEnabled();
	await seekChirho.scrollIntoViewIfNeeded();
	const boxChirho = (await seekChirho.boundingBox())!;
	await pageChirho.mouse.move(
		boxChirho.x + boxChirho.width * 0.25,
		boxChirho.y + boxChirho.height / 2
	);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(
		boxChirho.x + boxChirho.width * 0.75,
		boxChirho.y + boxChirho.height / 2
	);
	const wantedChirho = await seekChirho.inputValue();
	expect(Number(wantedChirho)).toBeGreaterThan(5);
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 0.5
			)
		)
		.toBe(true);
	await expect(seekChirho).toHaveValue(wantedChirho);
	await pageChirho.mouse.up();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					audioChirho.seconds_chirho >= Number(wantedChirho) - 0.1
			)
		)
		.toBe(true);
});

test('media failures stop after three fallback chapters and allow an explicit retry', async ({
	page: pageChirho
}) => {
	let requestsChirho = 0;
	await pageChirho.route('https://**/*.mp3', (routeChirho) => {
		requestsChirho += 1;
		return routeChirho.fulfill({ status: 404, body: '' });
	});
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect.poll(() => requestsChirho).toBe(4);
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeVisible();
	expect(
		(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect.poll(() => requestsChirho).toBe(8);
});

test('listening works when the browser denies storage and mobile controls fit the viewport', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 320, height: 740 });
	await pageChirho.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new DOMException('Storage denied', 'SecurityError');
			}
		});
	});
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
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
	await expect(pageChirho.getByText(/cannot save your place/)).toBeVisible();
	expect(
		await pageChirho.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
	).toBe(true);
	await expect(pageChirho.getByRole('combobox', { name: 'Language', exact: true })).toBeEnabled();
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await expect(pageChirho.getByRole('dialog')).toBeVisible();
	await pageChirho.keyboard.press('Escape');
	await expect(
		pageChirho.getByRole('button', { name: 'About and settings', exact: true })
	).toBeFocused();
});
