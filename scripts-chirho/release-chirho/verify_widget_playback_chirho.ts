// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { chromium as chromiumChirho } from 'playwright';
import { mkdir as mkdirChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { format as formatChirho } from 'prettier';
import {
	mediaStateChirho,
	observeMediaChirho
} from '../../tests-chirho/helpers-chirho/media_chirho';

// See spec-chirho/workflows-chirho/experience-chirho/widget_workflow_chirho.md.
// A reserved HTTPS parent is supplied by the probe; the public iframe and media are never replaced.
const originChirho = 'https://audiobiblerad.io';
const parentChirho = 'https://embed-host-chirho.example/';
const evidenceChirho = 'spec-chirho/evidence-chirho/widget-release-chirho';
const browserChirho = await chromiumChirho.launch({ headless: true });
const contextChirho = await browserChirho.newContext({
	viewport: { width: 1100, height: 900 },
	locale: 'en-US'
});
const pageChirho = await contextChirho.newPage();
const errorsChirho: string[] = [];
const samplesChirho: unknown[] = [];
pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
await mkdirChirho(evidenceChirho, { recursive: true });
const resultChirho: Record<string, unknown> = {
	measured_on_chirho: new Date().toISOString(),
	browser_chirho: `Chromium ${browserChirho.version()}`,
	parent_origin_chirho: new URL(parentChirho).origin,
	widget_origin_chirho: originChirho,
	method_chirho:
		'Controlled second-origin HTTPS parent with an explicit frame-src allowance. Actual public widget, catalogue, assets and source-host media; no media interception, insecure TLS flag or browser-protection override. Explicit On gesture. No Scripture bytes saved. Browser time advancement is not acoustic or physical-device proof.',
	samples_chirho: samplesChirho,
	errors_chirho: errorsChirho
};
try {
	await observeMediaChirho(pageChirho);
	await pageChirho.route(parentChirho, (routeChirho) =>
		routeChirho.fulfill({
			contentType: 'text/html',
			headers: { 'content-security-policy': `frame-src ${originChirho}` },
			body: `<!doctype html><html lang="en"><title>Outside host verification</title><body style="background:#f5f1e9"><h1>Outside host</h1><iframe title="Audio Bible Radio" src="${originChirho}/embed-chirho?theme_chirho=field&amp;language_chirho=en" width="390" height="820" allow="autoplay" referrerpolicy="no-referrer" style="border:0"></iframe></body></html>`
		})
	);
	await pageChirho.goto(parentChirho);
	const frameLocatorChirho = pageChirho.frameLocator('iframe');
	await frameLocatorChirho.getByRole('button', { name: 'Radio power', exact: true }).waitFor();
	const frameChirho = pageChirho
		.frames()
		.find((entryChirho) => entryChirho.url().startsWith(`${originChirho}/embed-chirho`));
	if (!frameChirho || new URL(frameChirho.url()).origin === new URL(parentChirho).origin)
		throw new Error('The test did not create a separate-origin public widget');
	const powerChirho = frameLocatorChirho.getByRole('button', { name: 'Radio power', exact: true });
	await powerChirho.click();
	for (const languageChirho of ['en', 'hi']) {
		if (languageChirho !== 'en') {
			await frameLocatorChirho
				.getByRole('combobox', { name: 'Language', exact: true })
				.selectOption(languageChirho);
			await frameLocatorChirho
				.getByRole('combobox', { name: 'Version', exact: true })
				.selectOption({ label: 'Biblica® Open Hindi Contemporary Version' });
		}
		await frameChirho.waitForFunction(
			() =>
				(window as unknown as { audioElementsChirho: HTMLAudioElement[] }).audioElementsChirho.some(
					(audioChirho) =>
						!audioChirho.paused &&
						!audioChirho.muted &&
						audioChirho.volume > 0 &&
						audioChirho.currentTime > 0.2 &&
						audioChirho.currentSrc.startsWith('https://') &&
						new URL(audioChirho.currentSrc).origin !== location.origin
				),
			null,
			{ timeout: 20000 }
		);
		const beforeChirho = (await mediaStateChirho(frameChirho)).find(
			(audioChirho) => !audioChirho.paused_chirho && audioChirho.url_chirho.startsWith('https://')
		)!;
		await frameChirho.waitForFunction(
			(beforeChirho) =>
				(window as unknown as { audioElementsChirho: HTMLAudioElement[] }).audioElementsChirho.some(
					(audioChirho) =>
						audioChirho.currentSrc === beforeChirho.url_chirho &&
						!audioChirho.paused &&
						audioChirho.currentTime >= beforeChirho.seconds_chirho + 0.25
				),
			beforeChirho,
			{ timeout: 5000 }
		);
		const creditChirho = frameLocatorChirho.locator('.credit-chirho');
		await creditChirho.scrollIntoViewIfNeeded();
		if (!(await creditChirho.isVisible())) throw new Error('Recording notice is hidden');
		const noticeChirho = (await creditChirho.innerText()).trim();
		const linksChirho = await creditChirho
			.locator('a')
			.evaluateAll((entriesChirho) => entriesChirho.map((entryChirho) => entryChirho.href));
		if (linksChirho.length !== 2 || !noticeChirho)
			throw new Error('Recording credit is incomplete');
		if (languageChirho === 'hi' && !noticeChirho.includes('Davar'))
			throw new Error('The additional source test did not select Davar');
		samplesChirho.push({
			language_chirho: languageChirho,
			before_chirho: beforeChirho,
			after_chirho: (await mediaStateChirho(frameChirho)).find(
				(audioChirho) => audioChirho.url_chirho === beforeChirho.url_chirho
			),
			visible_notice_chirho: noticeChirho,
			notice_links_chirho: linksChirho
		});
	}
	await powerChirho.click();
	if ((await mediaStateChirho(frameChirho)).some((audioChirho) => !audioChirho.paused_chirho))
		throw new Error('Off left an audio element playing');
	resultChirho.off_stopped_chirho = true;
	resultChirho.viewport_fits_chirho = await frameChirho.evaluate(
		() => document.documentElement.scrollWidth <= innerWidth
	);
	if (errorsChirho.length || !resultChirho.viewport_fits_chirho)
		throw new Error('A browser error or horizontal clipping was found');
	resultChirho.outcome_chirho = 'PASS';
} catch (errorChirho) {
	resultChirho.outcome_chirho = 'FAIL';
	resultChirho.failure_chirho =
		errorChirho instanceof Error ? errorChirho.message : String(errorChirho);
} finally {
	await browserChirho.close();
	await writeFileChirho(
		`${evidenceChirho}/widget_playback_chirho.json`,
		await formatChirho(JSON.stringify(resultChirho), { parser: 'json', useTabs: true })
	);
}
console.log(JSON.stringify(resultChirho));
if (resultChirho.outcome_chirho !== 'PASS')
	throw new Error('Hosted outside-widget playback failed');
