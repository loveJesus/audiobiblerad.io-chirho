// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, test, type Page } from '@playwright/test';
import { createServer as createServerChirho, type Server as ServerChirho } from 'node:http';
import type { AddressInfo as AddressInfoChirho } from 'node:net';
import {
	fixtureWaveChirho,
	mediaStateChirho,
	observeMediaChirho
} from './helpers-chirho/media_chirho';

let hostUrlChirho = '';
let hostServerChirho: ServerChirho;
let widgetPathChirho = '/embed-chirho';
let parentPolicyChirho = '';
test.beforeAll(async () => {
	const originChirho = test.info().project.use.baseURL!;
	hostServerChirho = createServerChirho((_requestChirho, responseChirho) => {
		responseChirho.writeHead(200, {
			'content-type': 'text/html',
			...(parentPolicyChirho ? { 'content-security-policy': parentPolicyChirho } : {})
		});
		responseChirho.end(
			`<!doctype html><html lang="en"><title>Outside host</title><body><h1>Outside host</h1><iframe src="${originChirho}${widgetPathChirho}" title="Embedded radio" width="360" height="760" allow="autoplay" referrerpolicy="no-referrer" style="border:0"></iframe></body></html>`
		);
	});
	await new Promise<void>((resolveChirho) =>
		hostServerChirho.listen(0, '127.0.0.1', resolveChirho)
	);
	hostUrlChirho = `http://127.0.0.1:${(hostServerChirho.address() as AddressInfoChirho).port}/`;
});
test.afterAll(async () => {
	hostServerChirho?.closeAllConnections();
	await new Promise<void>((resolveChirho, rejectChirho) =>
		hostServerChirho?.close((errorChirho) =>
			errorChirho ? rejectChirho(errorChirho) : resolveChirho()
		)
	);
});
async function hostChirho(
	pageChirho: Page,
	pathChirho = '/embed-chirho',
	policyChirho?: string
): Promise<void> {
	widgetPathChirho = pathChirho;
	parentPolicyChirho = policyChirho ?? '';
	await pageChirho.goto(hostUrlChirho);
}

test.beforeEach(async ({ page: pageChirho }) => {
	await observeMediaChirho(pageChirho);
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

test('a separately originated host can frame the widget, play unmuted and stop while retaining visible credits', async ({
	page: pageChirho
}) => {
	const originChirho = test.info().project.use.baseURL!;
	const responseChirho = await pageChirho.request.get('/embed-chirho');
	expect(responseChirho.status()).toBe(200);
	expect(responseChirho.headers()['content-security-policy']).toContain('frame-ancestors *');
	expect(responseChirho.headers()['x-frame-options']).toBeUndefined();
	await hostChirho(
		pageChirho,
		'/embed-chirho?theme_chirho=field&language_chirho=es',
		`frame-src ${originChirho}`
	);
	const frameChirho = pageChirho.frameLocator('iframe');
	await expect(frameChirho.getByRole('combobox', { name: 'Language', exact: true })).toHaveValue(
		'es'
	);
	await expect(frameChirho.locator('.radio-world-chirho')).toHaveAttribute(
		'data-radio-theme-chirho',
		'field'
	);
	await expect(
		frameChirho.getByRole('checkbox', { name: 'Radio sounds', exact: true })
	).not.toBeChecked();
	await expect(frameChirho.locator('.credit-chirho')).toBeVisible();
	await expect(frameChirho.locator('.theme-setting-chirho')).toHaveCount(0);
	await frameChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const actualFrameChirho = pageChirho
		.frames()
		.find((frameChirho) => frameChirho.url().startsWith(`${originChirho}/embed-chirho`))!;
	await expect
		.poll(async () =>
			(await mediaStateChirho(actualFrameChirho)).some(
				(audioChirho) =>
					audioChirho.url_chirho.startsWith('https://') &&
					!audioChirho.paused_chirho &&
					!audioChirho.muted_chirho &&
					audioChirho.seconds_chirho > 0.1
			)
		)
		.toBe(true);
	await frameChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	expect(
		(await mediaStateChirho(actualFrameChirho)).every((audioChirho) => audioChirho.paused_chirho)
	).toBe(true);
});

test('a parent frame-src denial is distinguishable from our allowed widget response', async ({
	page: pageChirho
}) => {
	const blockedChirho: string[] = [];
	pageChirho.on('console', (messageChirho) => {
		if (messageChirho.text().includes('frame-src')) blockedChirho.push(messageChirho.text());
	});
	await hostChirho(pageChirho, '/embed-chirho', "frame-src 'self'");
	await expect.poll(() => blockedChirho.length).toBeGreaterThan(0);
	await expect(
		pageChirho.frameLocator('iframe').getByRole('button', { name: 'Radio power', exact: true })
	).toHaveCount(0);
});

test('widget interaction never overwrites the full radio preferences and works when third-party storage is denied', async ({
	page: pageChirho
}) => {
	const originChirho = test.info().project.use.baseURL!;
	await pageChirho.addInitScript((originChirho) => {
		if (location.origin === originChirho)
			localStorage.setItem('audio-bible-radio-preferences-chirho', 'main-radio-sentinel-chirho');
	}, originChirho);
	await hostChirho(pageChirho);
	const frameChirho = pageChirho.frameLocator('iframe');
	await frameChirho.getByRole('combobox', { name: 'Chapter', exact: true }).selectOption('3');
	const actualFrameChirho = pageChirho
		.frames()
		.find((frameChirho) => frameChirho.url().startsWith(`${originChirho}/embed-chirho`))!;
	expect(
		await actualFrameChirho.evaluate(() =>
			localStorage.getItem('audio-bible-radio-preferences-chirho')
		)
	).toBe('main-radio-sentinel-chirho');
	await pageChirho.addInitScript(() => {
		if (window.top !== window)
			Object.defineProperty(window, 'localStorage', {
				get() {
					throw new DOMException('Third-party storage denied', 'SecurityError');
				}
			});
	});
	await pageChirho.reload();
	await frameChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	await expect(frameChirho.getByText(/cannot save your place/)).toBeVisible();
	await expect
		.poll(async () =>
			(
				await mediaStateChirho(
					pageChirho
						.frames()
						.find((frameChirho) => frameChirho.url().startsWith(`${originChirho}/embed-chirho`))!
				)
			).some((audioChirho) => !audioChirho.paused_chirho && audioChirho.seconds_chirho > 0.1)
		)
		.toBe(true);
});

test('the compact models fit 320 pixels and keep the copyright display reachable', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 320, height: 760 });
	await pageChirho.goto('/embed-chirho');
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
		await expect(pageChirho.locator('.credit-chirho')).toBeVisible();
		await expect(
			pageChirho.getByRole('button', { name: 'Radio power', exact: true })
		).toBeEnabled();
	}
});

test('the agent guide is publicly readable and the configurator produces the same supported iframe URL', async ({
	page: pageChirho
}) => {
	const responseChirho = await pageChirho.request.get('/llms.txt');
	expect(responseChirho.status()).toBe(200);
	expect(responseChirho.headers()['content-type']).toContain('text/plain');
	expect(responseChirho.headers()['access-control-allow-origin']).toBe('*');
	expect(await responseChirho.text()).toContain('https://audiobiblerad.io/embed-chirho');
	await pageChirho.goto('/widget-chirho');
	await pageChirho
		.getByRole('combobox', { name: 'Radio model', exact: true })
		.selectOption('cyberpunk');
	await pageChirho.getByRole('combobox', { name: /Starting language/ }).selectOption('es');
	const urlChirho = await pageChirho.getByLabel('Widget URL', { exact: true }).inputValue();
	expect(new URL(urlChirho).searchParams.get('language_chirho')).toBe('es');
	await expect(pageChirho.getByRole('textbox', { name: 'Iframe code', exact: true })).toHaveValue(
		new RegExp('theme_chirho=cyberpunk&amp;language_chirho=es')
	);
	await expect(
		pageChirho.frameLocator('iframe').getByRole('combobox', { name: 'Language', exact: true })
	).toHaveValue('es');
});
