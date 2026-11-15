// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, test, type Page } from '@playwright/test';
import {
	fixtureWaveChirho,
	mediaStateChirho,
	observeMediaChirho
} from './helpers-chirho/media_chirho';

// Exercise the permitted-policy path with a browser actually configured to allow audible startup.
test.use({ launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] } });

async function mediaRoutesChirho(pageChirho: Page): Promise<void> {
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
}

test('book and chapter label selects, knob pointers and keyboard turns stay synchronized', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho);
	await mediaRoutesChirho(pageChirho);
	await pageChirho.goto('/');
	const bookChirho = pageChirho.getByRole('combobox', { name: 'Book', exact: true });
	const bookKnobChirho = pageChirho.getByRole('slider', { name: 'Book knob', exact: true });
	const chapterChirho = pageChirho.getByRole('combobox', { name: 'Chapter', exact: true });
	const chapterKnobChirho = pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true });
	await bookChirho.selectOption({ label: 'Psalms' });
	await expect(bookKnobChirho).toHaveAttribute('aria-valuetext', 'Psalms');
	await chapterChirho.selectOption('150');
	await expect(chapterKnobChirho).toHaveAttribute('aria-valuenow', '150');
	expect(
		await chapterKnobChirho.evaluate((elementChirho) =>
			getComputedStyle(elementChirho).getPropertyValue('--knob-angle-chirho').trim()
		)
	).toBe('135deg');
	await chapterKnobChirho.press('Home');
	await expect(chapterChirho).toHaveValue('1');
	expect(
		await chapterKnobChirho.evaluate((elementChirho) =>
			getComputedStyle(elementChirho).getPropertyValue('--knob-angle-chirho').trim()
		)
	).toBe('-135deg');
	await bookKnobChirho.press('End');
	await expect(bookChirho).toHaveValue('66');
	await expect(bookKnobChirho).toHaveAttribute('aria-valuetext', 'Revelation');
});

test('a knob drag previews freely and commits one stream change on release', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho);
	await mediaRoutesChirho(pageChirho);
	const requestedChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		if (requestChirho.url().endsWith('.mp3')) requestedChirho.push(requestChirho.url());
	});
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect(pageChirho.getByText('ON AIR', { exact: true })).toBeVisible();
	const countChirho = requestedChirho.length;
	const knobChirho = pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true });
	await knobChirho.scrollIntoViewIfNeeded();
	const boxChirho = (await knobChirho.boundingBox())!;
	await pageChirho.mouse.move(
		boxChirho.x + boxChirho.width / 2,
		boxChirho.y + boxChirho.height / 2
	);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(
		boxChirho.x + boxChirho.width / 2,
		boxChirho.y + boxChirho.height / 2 - 75,
		{ steps: 8 }
	);
	expect(requestedChirho.length).toBe(countChirho);
	expect(Number(await knobChirho.getAttribute('aria-valuenow'))).toBeGreaterThan(1);
	await pageChirho.mouse.up();
	await expect.poll(() => requestedChirho.length).toBe(countChirho + 1);
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).not.toHaveValue(
		'1'
	);
});

test('all four radio skins keep controls, credits, focus and device memory on a narrow screen', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho);
	await mediaRoutesChirho(pageChirho);
	await pageChirho.setViewportSize({ width: 320, height: 844 });
	await pageChirho.goto('/');
	const modelChirho = pageChirho.getByRole('combobox', { name: 'Radio model', exact: true });
	for (const themeChirho of ['minimal', 'digital', 'field', 'cyberpunk']) {
		await modelChirho.selectOption(themeChirho);
		await expect(pageChirho.locator('.radio-world-chirho')).toHaveAttribute(
			'data-radio-theme-chirho',
			themeChirho
		);
		expect(
			await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		).toBe(true);
		await expect(
			pageChirho.getByRole('button', { name: 'Radio power', exact: true })
		).toBeEnabled();
		await expect(pageChirho.locator('.credit-chirho')).toBeVisible();
	}
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await expect(pageChirho.getByRole('dialog')).toBeVisible();
	await pageChirho.keyboard.press('Escape');
	await expect(
		pageChirho.getByRole('button', { name: 'About and settings', exact: true })
	).toBeFocused();
	await pageChirho.reload();
	await expect(pageChirho.locator('.radio-world-chirho')).toHaveAttribute(
		'data-radio-theme-chirho',
		'cyberpunk'
	);
	await expect(modelChirho).toHaveValue('cyberpunk');
});

test('allowed autoplay advances unmuted without a tap or tuning, and explicit Off survives reopening', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho, 'allowed');
	await mediaRoutesChirho(pageChirho);
	await pageChirho.goto('/');
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					!audioChirho.paused_chirho &&
					!audioChirho.muted_chirho &&
					audioChirho.seconds_chirho > 0.1
			)
		)
		.toBe(true);
	expect(
		(await mediaStateChirho(pageChirho)).some((audioChirho) =>
			audioChirho.url_chirho.includes('/sounds-chirho/')
		)
	).toBe(false);
	await expect(pageChirho.locator('.press-here-chirho')).toHaveCount(0);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect(
		pageChirho.getByRole('button', { name: 'Radio power', exact: true })
	).toHaveAttribute('aria-pressed', 'false');
	await pageChirho.reload();
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
	expect(
		(await mediaStateChirho(pageChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
	await expect(pageChirho.locator('.press-here-chirho')).toHaveCount(0);
});
test('a rejected autoplay attempt prompts at On and preserves the saved passage without recovery', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho, 'unknown');
	await mediaRoutesChirho(pageChirho);
	await pageChirho.addInitScript(() => {
		localStorage.setItem(
			'audio-bible-radio-preferences-chirho',
			JSON.stringify({
				station_id_chirho: 'helloao-bsb-hays',
				book_id_chirho: 'JHN',
				chapter_chirho: 3,
				seconds_chirho: 6,
				sounds_enabled_chirho: false
			})
		);
		const playChirho = HTMLMediaElement.prototype.play;
		HTMLMediaElement.prototype.play = function () {
			if (!navigator.userActivation.hasBeenActive)
				return Promise.reject(new DOMException('Gesture required', 'NotAllowedError'));
			return playChirho.call(this);
		};
	});
	await pageChirho.goto('/');
	await expect(pageChirho.locator('.press-here-chirho')).toBeVisible();
	await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toHaveValue('3');
	expect(
		await pageChirho.evaluate(
			() => JSON.parse(localStorage.getItem('audio-bible-radio-preferences-chirho')!).seconds_chirho
		)
	).toBe(6);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.includes('/JHN/3/') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho >= 6
			)
		)
		.toBe(true);
	await expect(pageChirho.locator('.press-here-chirho')).toHaveCount(0);
});

test('a Spanish browser chooses Spanish first and direct language selection moves the FM marker', async ({
	browser: browserChirho
}) => {
	const contextChirho = await browserChirho.newContext({
		locale: 'es-MX',
		baseURL: test.info().project.use.baseURL
	});
	const pageChirho = await contextChirho.newPage();
	try {
		await observeMediaChirho(pageChirho);
		await mediaRoutesChirho(pageChirho);
		await pageChirho.goto('/');
		const languageChirho = pageChirho.getByRole('combobox', { name: 'Language', exact: true });
		await expect(languageChirho).toHaveValue('es');
		const dialChirho = pageChirho.getByRole('slider', { name: 'Station dial', exact: true });
		const firstChirho = await dialChirho.inputValue();
		await languageChirho.selectOption('en');
		await expect(languageChirho).toHaveValue('en');
		await expect(dialChirho).not.toHaveValue(firstChirho);
		const englishChirho = await dialChirho.inputValue();
		await languageChirho.selectOption('es');
		await expect(languageChirho).toHaveValue('es');
		await dialChirho.fill(englishChirho);
		await expect(languageChirho).toHaveValue('en');
	} finally {
		await contextChirho.close();
	}
});

test('weather respects reduced motion and stops drawing while the tab is hidden', async ({
	page: pageChirho
}) => {
	await observeMediaChirho(pageChirho);
	await mediaRoutesChirho(pageChirho);
	await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
	await pageChirho.addInitScript(() => {
		const strokeChirho = CanvasRenderingContext2D.prototype.stroke;
		Object.assign(window, { weatherStrokesChirho: 0 });
		CanvasRenderingContext2D.prototype.stroke = function (
			...argumentsChirho: Parameters<typeof strokeChirho>
		) {
			if (this.canvas.classList.contains('theme-weather-chirho'))
				(window as unknown as { weatherStrokesChirho: number }).weatherStrokesChirho += 1;
			return strokeChirho.apply(this, argumentsChirho);
		};
	});
	await pageChirho.goto('/');
	await pageChirho
		.getByRole('combobox', { name: 'Radio model', exact: true })
		.selectOption('field');
	await pageChirho.locator('.theme-weather-chirho').waitFor();
	const strokesChirho = () =>
		pageChirho.evaluate(
			() => (window as unknown as { weatherStrokesChirho: number }).weatherStrokesChirho
		);
	expect(await strokesChirho()).toBe(0);
	await pageChirho.emulateMedia({ reducedMotion: 'no-preference' });
	await expect.poll(strokesChirho).toBeGreaterThan(0);
	// A deterministic visibility transition exercises teardown without relying on headless tab focus.
	await pageChirho.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	const stoppedChirho = await strokesChirho();
	await pageChirho.getByRole('button', { name: 'About and settings', exact: true }).click();
	await pageChirho.keyboard.press('Escape');
	expect(await strokesChirho()).toBe(stoppedChirho);
	await pageChirho.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: false });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await expect.poll(strokesChirho).toBeGreaterThan(stoppedChirho);
});
