// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test, expect, type Page as PageChirho } from '@playwright/test';
import { readFileSync as readFileChirho } from 'node:fs';
import {
	observeMediaChirho,
	mediaStateChirho,
	mediaEventsChirho,
	fixtureWaveChirho
} from './helpers-chirho/media_chirho';
import { effectEventChirho, effectSequenceChirho } from './helpers-chirho/effect_playback_chirho';

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
test.afterEach(async ({ page: pageChirho }, infoChirho) => {
	if (infoChirho.status !== infoChirho.expectedStatus && !pageChirho.isClosed()) {
		const eventsChirho = await mediaEventsChirho(pageChirho).catch(() => []);
		await infoChirho.attach('media_events_chirho', {
			body: JSON.stringify(eventsChirho, null, 2),
			contentType: 'application/json'
		});
	}
});
async function openChirho(pageChirho: PageChirho, preferenceChirho = 'two'): Promise<void> {
	await pageChirho.addInitScript((preferenceChirho) => {
		localStorage.setItem(
			'audio-bible-radio-view-chirho',
			preferenceChirho === 'three' ? 'two' : preferenceChirho
		);
		localStorage.setItem('audio-bible-radio-scene-chirho', 'original');
	}, preferenceChirho);
	await pageChirho.goto('/');
	await expect(pageChirho.getByRole('button', { name: 'Radio power', exact: true })).toBeEnabled();
	if (preferenceChirho === 'three')
		await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).click();
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

test('the weighted orbit moves, keeps the controls in view and gently returns after release', async ({
	page: pageChirho
}) => {
	await openChirho(pageChirho, 'three');
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
	const faceChirho = pageChirho.locator('.spatial-face-chirho');
	// Front view schedules the projected form on the next paint; sample its painted home pose.
	await pageChirho.evaluate(
		() =>
			new Promise<void>((resolveChirho) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolveChirho()))
			)
	);
	const matrixChirho = () =>
		faceChirho.evaluate((nodeChirho) =>
			Array.from(new DOMMatrix(getComputedStyle(nodeChirho).transform).toFloat64Array())
		);
	const homeChirho = await matrixChirho();
	const differenceChirho = async () =>
		Math.max(
			...(await matrixChirho()).map((valueChirho, indexChirho) =>
				Math.abs(valueChirho - homeChirho[indexChirho])
			)
		);
	await pageChirho.mouse.move(24, 160);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(780, 210, { steps: 18 });
	await expect.poll(differenceChirho).toBeGreaterThan(10);
	await expect(faceChirho).toHaveCSS('visibility', 'visible');
	await pageChirho.mouse.up();
	await expect.poll(differenceChirho, { timeout: 12000 }).toBeLessThan(1);
	await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
	await pageChirho.mouse.move(24, 160);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(650, 210, { steps: 14 });
	await pageChirho.mouse.up();
	await pageChirho.waitForTimeout(1400);
	const stoppedChirho = await matrixChirho();
	await pageChirho.waitForTimeout(600);
	const laterChirho = await matrixChirho();
	expect(
		Math.max(
			...laterChirho.map((valueChirho, indexChirho) =>
				Math.abs(valueChirho - stoppedChirho[indexChirho])
			)
		)
	).toBeLessThan(0.05);
	await expect(faceChirho).toHaveCSS('visibility', 'visible');
});

test('long publisher notices do not resize the hardware or move its controls', async ({
	page: pageChirho
}) => {
	const fileChirho = JSON.parse(
		readFileChirho('static/catalogue-chirho/languages-chirho/h/hi.json', 'utf8')
	) as {
		stations_chirho: { id_chirho: string; version_chirho: string; credit_chirho: string }[];
	};
	const stationChirho = fileChirho.stations_chirho[0];
	stationChirho.credit_chirho +=
		' The publisher copyright and recording notice remains available in full. '.repeat(20);
	await pageChirho.route('**/catalogue-chirho/languages-chirho/h/hi.json', (routeChirho) =>
		routeChirho.fulfill({ json: fileChirho })
	);
	await pageChirho.setViewportSize({ width: 1280, height: 1000 });
	await openChirho(pageChirho);
	const layoutChirho = () =>
		pageChirho.locator('.radio-chirho').evaluate((nodeChirho) => {
			const powerChirho = nodeChirho.querySelector<HTMLElement>('.power-well-chirho')!;
			return {
				width_chirho: (nodeChirho as HTMLElement).offsetWidth,
				height_chirho: (nodeChirho as HTMLElement).offsetHeight,
				power_x_chirho: powerChirho.offsetLeft,
				power_y_chirho: powerChirho.offsetTop
			};
		});
	for (const themeChirho of ['minimal', 'field', 'digital', 'cyberpunk']) {
		await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('en');
		await pageChirho
			.getByRole('combobox', { name: 'Radio model', exact: true })
			.selectOption(themeChirho);
		const beforeChirho = await layoutChirho();
		await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('hi');
		await pageChirho
			.getByRole('combobox', { name: 'Version', exact: true })
			.selectOption({ label: stationChirho.version_chirho });
		await pageChirho
			.getByRole('combobox', { name: 'Narration', exact: true })
			.selectOption(stationChirho.id_chirho);
		await expect(pageChirho.locator('.credit-chirho')).toContainText(stationChirho.credit_chirho);
		expect(await layoutChirho()).toEqual(beforeChirho);
	}
	await pageChirho
		.getByRole('combobox', { name: 'Radio model', exact: true })
		.selectOption('digital');
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	const longChirho = await layoutChirho();
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('en');
	expect(await layoutChirho()).toEqual(longChirho);
});

test('a real 3D radio stays within its viewing cone and its controls preserve playback across views', async ({
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
	await expect(pageChirho.locator('.spatial-face-chirho')).toHaveCSS('visibility', 'visible');
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toBeVisible();
	await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
	await expect(pageChirho.locator('.spatial-face-chirho')).toHaveCSS('visibility', 'visible');
	await pageChirho.getByRole('button', { name: 'Switch to 2D radio', exact: true }).click();
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

test('the modeled settings and camera controls change around one continuing radio', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 1440, height: 1000 });
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
	for (const themeChirho of ['field', 'digital', 'cyberpunk']) {
		await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
		await pageChirho
			.getByRole('combobox', { name: 'Radio model', exact: true })
			.selectOption(themeChirho);
		await expect(pageChirho.locator('.radio-world-chirho')).toHaveAttribute(
			'data-radio-theme-chirho',
			themeChirho
		);
		await pageChirho.getByRole('button', { name: 'Scene view', exact: true }).click();
		await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toBeVisible();
		await pageChirho.getByRole('button', { name: 'Move camera farther', exact: true }).click();
		await pageChirho.getByRole('button', { name: 'Move camera closer', exact: true }).click();
		await unchangedElementChirho(pageChirho);
		await pageChirho.screenshot({
			path: test.info().outputPath(`${themeChirho}_world_chirho.png`)
		});
		await pageChirho.mouse.move(30, 200);
		await pageChirho.mouse.down();
		await pageChirho.mouse.move(850, 200, { steps: 24 });
		await pageChirho.mouse.up();
		await expect(pageChirho.locator('.spatial-face-chirho')).toHaveCSS('visibility', 'visible');
		await pageChirho.screenshot({
			path: test.info().outputPath(`${themeChirho}_angled_chirho.png`)
		});
		await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
		await expect(pageChirho.getByRole('combobox', { name: 'Chapter', exact: true })).toBeVisible();
	}
	await pageChirho.getByRole('button', { name: 'Switch to 2D radio', exact: true }).click();
	await expect(pageChirho.locator('canvas.radio-geometry-chirho')).toHaveCount(0);
	await unchangedElementChirho(pageChirho);
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

test('a living scene stops graphics work for reduced motion and when offscreen, without stopping Scripture', async ({
	page: pageChirho
}) => {
	await pageChirho.addInitScript(() => {
		const stateChirho = window as unknown as { graphicsDrawsChirho: number };
		stateChirho.graphicsDrawsChirho = 0;
		const originalChirho = WebGL2RenderingContext.prototype.drawElements;
		WebGL2RenderingContext.prototype.drawElements = function (
			...argumentsChirho: Parameters<typeof originalChirho>
		) {
			stateChirho.graphicsDrawsChirho++;
			return Reflect.apply(originalChirho, this, argumentsChirho);
		};
	});
	const drawsChirho = () =>
		pageChirho.evaluate(
			() => (window as unknown as { graphicsDrawsChirho: number }).graphicsDrawsChirho
		);
	await openChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	await pageChirho
		.getByRole('combobox', { name: 'Radio model', exact: true })
		.selectOption('field');
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	const movingChirho = await drawsChirho();
	await expect.poll(drawsChirho).toBeGreaterThan(movingChirho);
	await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
	await pageChirho.waitForTimeout(1200);
	const stillChirho = await drawsChirho();
	await pageChirho.waitForTimeout(500);
	expect(await drawsChirho()).toBe(stillChirho);
	await pageChirho.emulateMedia({ reducedMotion: 'no-preference' });
	await expect.poll(drawsChirho).toBeGreaterThan(stillChirho);
	await pageChirho.evaluate(() => {
		document.body.style.paddingBottom = '2000px';
		scrollTo(0, document.documentElement.scrollHeight);
	});
	await pageChirho.waitForTimeout(500);
	const offscreenChirho = await drawsChirho();
	await pageChirho.waitForTimeout(500);
	expect(await drawsChirho()).toBe(offscreenChirho);
	await unchangedElementChirho(pageChirho);
	await pageChirho.evaluate(() => {
		document.body.style.paddingBottom = '';
		scrollTo(0, 0);
	});
	await expect.poll(drawsChirho).toBeGreaterThan(offscreenChirho);
});

test('phone controls remain usable in each modeled radio', async ({ page: pageChirho }) => {
	await pageChirho.setViewportSize({ width: 390, height: 844 });
	await openChirho(pageChirho);
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 20000 }
	);
	for (const themeChirho of ['field', 'digital', 'cyberpunk']) {
		await pageChirho.getByRole('button', { name: 'Front view', exact: true }).click();
		await pageChirho
			.getByRole('combobox', { name: 'Radio model', exact: true })
			.selectOption(themeChirho);
		const powerChirho = await pageChirho
			.getByRole('button', { name: 'Radio power', exact: true })
			.boundingBox();
		expect(powerChirho?.width).toBeGreaterThanOrEqual(44);
		expect(powerChirho?.height).toBeGreaterThanOrEqual(44);
		expect(
			await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		).toBe(true);
		await pageChirho.screenshot({
			path: test.info().outputPath(`${themeChirho}_phone_chirho.png`)
		});
	}
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await playingChirho(pageChirho);
});

test('reduced motion starts lightweight, with an explicit 3D choice still available', async ({
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
	const responseChirho = pageChirho.waitForResponse('**/sounds-chirho/profile_chirho.json');
	await openChirho(pageChirho);
	const profileChirho = (await (await responseChirho).json()) as {
		click_chirho: { url_chirho: string }[];
		knob_chirho: { url_chirho: string; start_seconds_chirho?: number }[];
	};
	const clickPathChirho = profileChirho.click_chirho[0].url_chirho;
	const knobClipChirho = profileChirho.knob_chirho[0];
	const onSequenceChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await effectEventChirho(pageChirho, clickPathChirho, 'playing', onSequenceChirho);
	await effectEventChirho(pageChirho, clickPathChirho, 'ended', onSequenceChirho);
	const offSequenceChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	expect(
		(await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)?.paused_chirho
	).toBe(true);
	await effectEventChirho(pageChirho, clickPathChirho, 'playing', offSequenceChirho);
	await effectEventChirho(pageChirho, clickPathChirho, 'ended', offSequenceChirho);
	const knobSequenceChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('slider', { name: 'Chapter knob', exact: true }).press('ArrowUp');
	await effectEventChirho(pageChirho, knobClipChirho.url_chirho, 'playing', knobSequenceChirho);
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

test('a bounded slow interface start reaches native completion without interrupting Scripture', async ({
	page: pageChirho,
	browserName: browserNameChirho
}) => {
	const responseChirho = pageChirho.waitForResponse('**/sounds-chirho/profile_chirho.json');
	await openChirho(pageChirho);
	const profileChirho = (await (await responseChirho).json()) as {
		click_chirho: { url_chirho: string }[];
	};
	const pathChirho = profileChirho.click_chirho[0].url_chirho;
	const delayChirho = browserNameChirho === 'webkit' ? 800 : 1300;
	let heldChirho = false;
	await pageChirho.route(
		(urlChirho) => urlChirho.pathname === pathChirho,
		async (routeChirho) => {
			if (!heldChirho) {
				heldChirho = true;
				await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, delayChirho));
			}
			await routeChirho.continue();
		}
	);
	const beforeChirho = await effectSequenceChirho(pageChirho);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await playingChirho(pageChirho);
	await rememberElementChirho(pageChirho);
	const playingEventChirho = await effectEventChirho(
		pageChirho,
		pathChirho,
		'playing',
		beforeChirho
	);
	const endedEventChirho = await effectEventChirho(pageChirho, pathChirho, 'ended', beforeChirho);
	expect(heldChirho).toBe(true);
	expect(endedEventChirho.sequence_chirho).toBeGreaterThan(playingEventChirho.sequence_chirho);
	expect(endedEventChirho.has_source_chirho).toBe(true);
	const eventsChirho = (await mediaEventsChirho(pageChirho)).filter(
		(eventChirho) =>
			eventChirho.sequence_chirho > beforeChirho &&
			eventChirho.sequence_chirho <= endedEventChirho.sequence_chirho &&
			eventChirho.url_chirho.split('#')[0].endsWith(pathChirho)
	);
	expect(
		eventsChirho.some((eventChirho) =>
			['release_source_chirho', 'error', 'play_rejected_chirho'].includes(eventChirho.kind_chirho)
		)
	).toBe(false);
	await unchangedElementChirho(pageChirho);
	await playingChirho(pageChirho);
	await test.info().attach('delayed_effect_events_chirho', {
		body: JSON.stringify(
			{ delay_ms_chirho: delayChirho, events_chirho: await mediaEventsChirho(pageChirho) },
			null,
			2
		),
		contentType: 'application/json'
	});
});

test('a later deliberate press retries a failed interface recording without an automatic retry loop', async ({
	page: pageChirho
}) => {
	const responseChirho = pageChirho.waitForResponse('**/sounds-chirho/profile_chirho.json');
	await openChirho(pageChirho);
	const profileChirho = (await (await responseChirho).json()) as {
		click_chirho: { url_chirho: string }[];
	};
	const pathChirho = profileChirho.click_chirho[0].url_chirho;
	let requestsChirho = 0;
	await pageChirho.route(
		(urlChirho) => urlChirho.pathname === pathChirho,
		async (routeChirho) => {
			requestsChirho += 1;
			if (requestsChirho === 1)
				await routeChirho.fulfill({
					status: 503,
					contentType: 'audio/wav',
					body: 'temporarily-unavailable-chirho'
				});
			else await routeChirho.continue();
		}
	);
	const beforeChirho = await effectSequenceChirho(pageChirho);
	const powerChirho = pageChirho.getByRole('button', { name: 'Radio power', exact: true });
	await powerChirho.click();
	await playingChirho(pageChirho);
	await expect
		.poll(async () =>
			(await mediaEventsChirho(pageChirho)).some(
				(eventChirho) =>
					eventChirho.sequence_chirho > beforeChirho &&
					eventChirho.kind_chirho === 'error' &&
					eventChirho.error_code_chirho === 4 &&
					eventChirho.url_chirho.endsWith(pathChirho)
			)
		)
		.toBe(true);
	expect(requestsChirho).toBe(1);
	const retrySequenceChirho = await effectSequenceChirho(pageChirho);
	await powerChirho.click();
	await effectEventChirho(pageChirho, pathChirho, 'playing', retrySequenceChirho);
	await effectEventChirho(pageChirho, pathChirho, 'ended', retrySequenceChirho);
	expect(requestsChirho).toBeGreaterThan(1);
	expect(
		(await mediaStateChirho(pageChirho)).find((audioChirho) =>
			audioChirho.url_chirho.startsWith('https://')
		)?.paused_chirho
	).toBe(true);
	await test.info().attach('retried_effect_events_chirho', {
		body: JSON.stringify(await mediaEventsChirho(pageChirho), null, 2),
		contentType: 'application/json'
	});
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
	test.skip(
		({ browserName: browserNameChirho }) => browserNameChirho !== 'chromium',
		'This probe sends native Chromium touch input.'
	);
	test.use({ hasTouch: true, viewport: { width: 390, height: 620 } });
	test('a vertical swipe over the scene scrolls while a horizontal gesture remains available for orbit', async ({
		page: pageChirho
	}) => {
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
