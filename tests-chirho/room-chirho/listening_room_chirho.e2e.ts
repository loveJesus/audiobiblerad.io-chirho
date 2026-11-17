// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test, expect } from '@playwright/test';
import {
	fixtureWaveChirho,
	observeMediaChirho,
	mediaStateChirho
} from '../helpers-chirho/media_chirho';

test('room controls tune, preview labels during a turn and restore all original themes around the same audio', async ({
	page: pageChirho
}) => {
	test.setTimeout(90000);
	await pageChirho.setViewportSize({ width: 1440, height: 1000 });
	await observeMediaChirho(pageChirho);
	await pageChirho.addInitScript(() =>
		localStorage.setItem('audio-bible-radio-view-chirho', 'two')
	);
	await pageChirho.route('https://**/*', (routeChirho) =>
		routeChirho.request().url().endsWith('.mp3')
			? routeChirho.fulfill({ contentType: 'audio/wav', body: fixtureWaveChirho(120) })
			: routeChirho.fulfill({ status: 404, body: '' })
	);
	await pageChirho.goto('/');
	await pageChirho.getByRole('button', { name: 'Start listening', exact: true }).click();
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 30000 }
	);
	await expect(
		pageChirho.getByRole('button', { name: 'Switch to 2D radio', exact: true })
	).toBeFocused();
	const roomChirho = pageChirho.locator('.room-controls-chirho');
	const labelChirho = roomChirho.getByRole('combobox', { name: 'Book label', exact: true });
	const oldBookChirho = await labelChirho.inputValue();
	const knobChirho = roomChirho.getByRole('slider', { name: 'Book', exact: true });
	const boundsChirho = (await knobChirho.boundingBox())!;
	await pageChirho.mouse.move(
		boundsChirho.x + boundsChirho.width / 2,
		boundsChirho.y + boundsChirho.height / 2
	);
	await pageChirho.mouse.down();
	await pageChirho.mouse.move(
		boundsChirho.x + boundsChirho.width / 2,
		boundsChirho.y + boundsChirho.height / 2 - 15,
		{ steps: 8 }
	);
	await expect(labelChirho).not.toHaveValue(oldBookChirho);
	const previewBookChirho = await labelChirho.inputValue();
	const previewNameChirho = await labelChirho.locator('option:checked').innerText();
	await pageChirho.waitForTimeout(400);
	await expect(labelChirho).toHaveValue(previewBookChirho);
	await pageChirho.mouse.up();
	await expect(labelChirho).toHaveValue(previewBookChirho);
	const stationChirho = roomChirho.getByRole('combobox', { name: 'Narration', exact: true });
	const oldStationChirho = await stationChirho.inputValue();
	await roomChirho.getByRole('slider', { name: 'Station tuning', exact: true }).press('ArrowRight');
	await expect(stationChirho).not.toHaveValue(oldStationChirho);
	const afterKnobChirho = await stationChirho.inputValue();
	await roomChirho.getByRole('slider', { name: 'Station dial', exact: true }).press('ArrowRight');
	await expect(stationChirho).not.toHaveValue(afterKnobChirho);
	await expect
		.poll(
			async () =>
				(await mediaStateChirho(pageChirho)).find((audioChirho) =>
					audioChirho.url_chirho.startsWith('https://')
				)?.seconds_chirho
		)
		.toBeGreaterThan(0.2);
	await pageChirho.evaluate(() => {
		const stateChirho = window as unknown as {
			audioElementsChirho: HTMLAudioElement[];
			audioLoadCountsChirho: WeakMap<HTMLAudioElement, number>;
			roomAudioChirho?: HTMLAudioElement;
			roomLoadsChirho?: number;
		};
		stateChirho.roomAudioChirho = stateChirho.audioElementsChirho.find((audioChirho) =>
			audioChirho.src.startsWith('https://')
		);
		stateChirho.roomLoadsChirho =
			stateChirho.audioLoadCountsChirho.get(stateChirho.roomAudioChirho!) ?? 0;
	});
	await pageChirho.screenshot({ path: test.info().outputPath('room_chirho.png') });
	await pageChirho.getByRole('button', { name: 'Switch to 2D radio', exact: true }).click();
	await expect(
		pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true })
	).toBeFocused();
	await expect(pageChirho.locator('canvas')).toHaveCount(0);
	for (const themeChirho of ['minimal', 'digital', 'field', 'cyberpunk']) {
		await pageChirho
			.getByRole('combobox', { name: 'Radio model', exact: true })
			.selectOption(themeChirho);
		await expect(pageChirho.locator('.radio-world-chirho')).toHaveAttribute(
			'data-radio-theme-chirho',
			themeChirho
		);
		await expect(
			pageChirho.getByRole('button', { name: 'Radio power', exact: true })
		).toBeVisible();
	}
	await expect(
		pageChirho.getByRole('combobox', { name: 'Book', exact: true }).locator('option:checked')
	).toHaveText(previewNameChirho);
	expect(
		await pageChirho.evaluate(() => {
			const stateChirho = window as unknown as {
				audioElementsChirho: HTMLAudioElement[];
				audioLoadCountsChirho: WeakMap<HTMLAudioElement, number>;
				roomAudioChirho: HTMLAudioElement;
				roomLoadsChirho: number;
			};
			return (
				stateChirho.audioElementsChirho.includes(stateChirho.roomAudioChirho) &&
				!stateChirho.roomAudioChirho.paused &&
				stateChirho.audioLoadCountsChirho.get(stateChirho.roomAudioChirho) ===
					stateChirho.roomLoadsChirho
			);
		})
	).toBe(true);
	await pageChirho.screenshot({ path: test.info().outputPath('restored_theme_chirho.png') });
	// Lose a real active GPU context; the existing Scripture element must survive disposal.
	await pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true }).check();
	await expect(pageChirho.locator('.spatial-view-chirho')).toHaveAttribute(
		'data-spatial-active-chirho',
		'true',
		{ timeout: 30000 }
	);
	await pageChirho.locator('canvas.listening-room-canvas-chirho').evaluate((canvasChirho) => {
		const extensionChirho = (canvasChirho as HTMLCanvasElement)
			.getContext('webgl2')
			?.getExtension('WEBGL_lose_context');
		if (!extensionChirho) throw new Error('Real context loss is unavailable');
		extensionChirho.loseContext();
	});
	await expect(pageChirho.locator('canvas')).toHaveCount(0);
	await expect(
		pageChirho.getByRole('checkbox', { name: '3D radio view', exact: true })
	).toBeFocused();
	expect(
		await pageChirho.evaluate(() => {
			const stateChirho = window as unknown as {
				audioElementsChirho: HTMLAudioElement[];
				audioLoadCountsChirho: WeakMap<HTMLAudioElement, number>;
				roomAudioChirho: HTMLAudioElement;
				roomLoadsChirho: number;
			};
			return (
				stateChirho.audioElementsChirho.includes(stateChirho.roomAudioChirho) &&
				!stateChirho.roomAudioChirho.paused &&
				stateChirho.audioLoadCountsChirho.get(stateChirho.roomAudioChirho) ===
					stateChirho.roomLoadsChirho
			);
		})
	).toBe(true);
});
