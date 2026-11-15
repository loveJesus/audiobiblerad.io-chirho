// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test, expect, type Page as PageChirho } from '@playwright/test';
import {
	observeMediaChirho,
	mediaStateChirho,
	fixtureWaveChirho
} from './helpers-chirho/media_chirho';

test.setTimeout(60000);
test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
	await pageChirho.route('https://**/*.mp3', (routeChirho) =>
		routeChirho.fulfill({
			contentType: 'audio/wav',
			body: fixtureWaveChirho(60),
			headers: { 'accept-ranges': 'bytes' }
		})
	);
	await pageChirho.route('https://**/*.audioTimings.json', (routeChirho) =>
		routeChirho.fulfill({ status: 404, body: '' })
	);
});
async function openChirho(pageChirho: PageChirho, preferenceChirho = 'simple'): Promise<void> {
	await pageChirho.addInitScript(
		(preferenceChirho) => localStorage.setItem('audio-bible-radio-view-chirho', preferenceChirho),
		preferenceChirho
	);
	await pageChirho.goto('/');
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
}
async function playingChirho(pageChirho: PageChirho): Promise<void> {
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					!audioChirho.paused_chirho &&
					audioChirho.seconds_chirho > 0.15
			)
		)
		.toBe(true);
}
async function rememberElementChirho(pageChirho: PageChirho): Promise<void> {
	await pageChirho.evaluate(() => {
		const stateChirho = window as unknown as {
			audioElementsChirho: HTMLAudioElement[];
			rememberedAudioChirho?: HTMLAudioElement;
			audioLoadCountsChirho: WeakMap<HTMLAudioElement, number>;
			rememberedAudioLoadsChirho?: number;
		};
		stateChirho.rememberedAudioChirho = stateChirho.audioElementsChirho.find((audioChirho) =>
			audioChirho.currentSrc.startsWith('https://')
		);
		if (stateChirho.rememberedAudioChirho)
			stateChirho.rememberedAudioLoadsChirho =
				stateChirho.audioLoadCountsChirho.get(stateChirho.rememberedAudioChirho) ?? 0;
	});
}
async function unchangedElementChirho(pageChirho: PageChirho): Promise<void> {
	expect(
		await pageChirho.evaluate(() => {
			const stateChirho = window as unknown as {
				audioElementsChirho: HTMLAudioElement[];
				rememberedAudioChirho?: HTMLAudioElement;
				audioLoadCountsChirho: WeakMap<HTMLAudioElement, number>;
				rememberedAudioLoadsChirho?: number;
			};
			return (
				!!stateChirho.rememberedAudioChirho &&
				!stateChirho.rememberedAudioChirho.paused &&
				stateChirho.audioElementsChirho.includes(stateChirho.rememberedAudioChirho) &&
				(stateChirho.audioLoadCountsChirho.get(stateChirho.rememberedAudioChirho) ?? 0) ===
					stateChirho.rememberedAudioLoadsChirho
			);
		})
	).toBe(true);
}

test('a real 3D radio orbits and its native controls work without replacing playback when views switch', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-loading-chirho',
		'false',
		{ timeout: 15000 }
	);
	await unchangedElementChirho(pageChirho);
	await pageChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
	await expect(
		pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true })
	).toHaveAttribute('aria-valuenow', '3');
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	await pageChirho.mouse.move(30, 150);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(800, 150, { steps: 24 });
	await pageChirho.mouse.up();
	await expect(pageChirho.locator('.spatial-face-chirho')).toHaveCSS('visibility', 'hidden');
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toBeVisible();
	await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
	await expect(pageChirho.locator('.spatial-face-chirho')).toHaveCSS('visibility', 'visible');
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).uncheck();
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
	await unchangedElementChirho(pageChirho);
	expect((await mediaStateChirho(pageChirho)).length).toBeLessThanOrEqual(3);
});

test('losing the real graphics context returns to simple while the same audio keeps advancing', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho, 'three');
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	await pageChirho.locator('canvas.radio-geometry-chirho').evaluate((canvasChirho) => {
		const contextChirho = (canvasChirho as HTMLCanvasElement).getContext('webgl2');
		const extensionChirho = contextChirho?.getExtension('WEBGL_lose_context');
		if (!extensionChirho) throw new Error('The real context-loss control is unavailable');
		extensionChirho.loseContext();
	});
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'false'
	);
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
	await unchangedElementChirho(pageChirho);
	await playingChirho(pageChirho);
	expect(
		await pageChirho.evaluate(() => localStorage.getItem('audio-bible-radio-view-chirho'))
	).toBe('three');
});

test('an unavailable renderer cannot prevent the lightweight radio from playing', async ({
	page: pageChirho
}) => {
	await pageChirho.addInitScript(() => {
		const originalChirho = HTMLCanvasElement.prototype.getContext;
		HTMLCanvasElement.prototype.getContext = function (
			...argumentsChirho: Parameters<typeof originalChirho>
		) {
			return argumentsChirho[0] === 'webgl2'
				? null
				: Reflect.apply(originalChirho, this, argumentsChirho);
		} as typeof originalChirho;
	});
	await openChirho(pageChirho, 'three');
	await expect(pageChirho.locator('.spatial-message-chirho')).toBeVisible();
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
});

test('reduced motion keeps automatic selection light, with an explicit manual choice still available', async ({
	page: pageChirho
}) => {
	await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
	await openChirho(pageChirho, 'auto');
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
});

test('automatic choice judges the actual scene after sound starts and never reloads the playing source', async ({
	page: pageChirho
}) => {
	await pageChirho.addInitScript(() => {
		Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 });
		Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 });
	});
	await openChirho(pageChirho, 'auto');
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-view-assessment-chirho',
		/^(smooth|slow)$/,
		{ timeout: 20000 }
	);
	const assessmentChirho = await pageChirho
		.locator('.spatial-view-chirho')
		.getAttribute('data-view-assessment-chirho');
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		assessmentChirho === 'smooth' ? 'true' : 'false'
	);
	await unchangedElementChirho(pageChirho);
});

test('a touch-sized scene stays within the screen and keeps the On cue actionable', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 390, height: 844 });
	await openChirho(pageChirho, 'three');
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	const cueChirho = pageChirho.getByRole('button', { name: 'Start listening', exact: true });
	const boxChirho = await cueChirho.boundingBox();
	expect(boxChirho?.width).toBeGreaterThan(70);
	expect(boxChirho?.height).toBeGreaterThan(32);
	await cueChirho.click();
	await playingChirho(pageChirho);
	expect(await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
		true
	);
	await expect(pageChirho.locator('.credit-chirho')).toBeVisible();
});

test('the prepared effects play for presses and knob turns, and disabling sound keeps later actions quiet', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho);
	const profileChirho = (await (
		await pageChirho.request.get('/sounds-chirho/profile_chirho.json')
	).json()) as {
		click_chirho: { url_chirho: string }[];
		knob_chirho: { url_chirho: string; start_seconds_chirho?: number }[];
	};
	const clickPathChirho = profileChirho.click_chirho[0].url_chirho;
	const knobClipChirho = profileChirho.knob_chirho[0];
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.endsWith(clickPathChirho) && audioChirho.seconds_chirho > 0
			)
		)
		.toBe(true);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	expect(
		(await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)?.paused_chirho
	).toBe(true);
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.endsWith(clickPathChirho) && audioChirho.seconds_chirho > 0
			)
		)
		.toBe(true);
	await expect
		.poll(
			async () =>
				(await mediaStateChirho(pageChirho)).find((audioChirho) =>
					audioChirho.url_chirho.endsWith(clickPathChirho)
				)?.paused_chirho
		)
		.toBe(true);
	await pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true }).press('ArrowUp');
	await expect
		.poll(async () =>
			(await mediaStateChirho(pageChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.split('#')[0].endsWith(knobClipChirho.url_chirho) &&
					audioChirho.seconds_chirho > (knobClipChirho.start_seconds_chirho ?? 0)
			)
		)
		.toBe(true);
	await pageChirho.getByRole('checkbox', { name: 'Radio sounds', exact: true }).uncheck();
	const countsChirho = await pageChirho.evaluate(() => {
		const traceChirho = window as unknown as {
			audioElementsChirho: HTMLAudioElement[];
			audioPlayCountsChirho: WeakMap<HTMLAudioElement, number>;
		};
		return traceChirho.audioElementsChirho.map(
			(audioChirho) => traceChirho.audioPlayCountsChirho.get(audioChirho) ?? 0
		);
	});
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true }).press('ArrowUp');
	const afterChirho = await pageChirho.evaluate(() => {
		const traceChirho = window as unknown as {
			audioElementsChirho: HTMLAudioElement[];
			audioPlayCountsChirho: WeakMap<HTMLAudioElement, number>;
		};
		return traceChirho.audioElementsChirho.map((audioChirho) => ({
			own_chirho: audioChirho.currentSrc.startsWith(location.origin),
			count_chirho: traceChirho.audioPlayCountsChirho.get(audioChirho) ?? 0,
			paused_chirho: audioChirho.paused
		}));
	});
	for (let indexChirho = 0; indexChirho < afterChirho.length; indexChirho++)
		if (afterChirho[indexChirho].own_chirho) {
			expect(afterChirho[indexChirho].count_chirho).toBe(countsChirho[indexChirho]);
			expect(afterChirho[indexChirho].paused_chirho).toBe(true);
		}
});

test('wheel scrolling over the active scene still moves the page', async ({ page: pageChirho }) => {
	await pageChirho.setViewportSize({ width: 1280, height: 560 });
	await openChirho(pageChirho, 'three');
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	await pageChirho.mouse.move(640, 300);
	await pageChirho.mouse.wheel(0, 240);
	await expect.poll(() => pageChirho.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test.describe('touch scene scrolling', () => {
	test.use({ hasTouch: true, viewport: { width: 390, height: 620 } });
	test('a vertical swipe over the scene scrolls while a horizontal gesture remains available for orbit', async ({
		page: pageChirho,
		browserName: browserNameChirho
	}) => {
		test.skip(browserNameChirho !== 'chromium', 'This probe sends native Chromium touch input.');
		await openChirho(pageChirho, 'three');
		await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
			'data-spatial-active-chirho',
			'true',
			{ timeout: 20000 }
		);
		const inputChirho = await pageChirho.context().newCDPSession(pageChirho);
		try {
			await inputChirho.send('Input.dispatchTouchEvent', {
				type: 'touchStart',
				touchPoints: [{ x: 18, y: 460 }]
			});
			for (const yChirho of [420, 380, 340, 300, 260]) {
				await inputChirho.send('Input.dispatchTouchEvent', {
					type: 'touchMove',
					touchPoints: [{ x: 18, y: yChirho }]
				});
				await pageChirho.waitForTimeout(20);
			}
			await inputChirho.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
			await expect.poll(() => pageChirho.evaluate(() => scrollY)).toBeGreaterThan(80);
		} finally {
			await inputChirho.detach();
		}
	});
});
