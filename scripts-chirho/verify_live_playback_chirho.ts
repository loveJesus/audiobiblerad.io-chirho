// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { format as formatChirho, resolveConfig as resolveConfigChirho } from 'prettier';

// See spec-chirho/workflows-chirho/verification_workflow_chirho.md.
// A bounded opt-in probe against the real source hosts. No Scripture bytes are saved.
const previewUrlChirho = new URL(process.env.RADIO_PREVIEW_URL_CHIRHO ?? 'http://127.0.0.1:5196/');
const productionProbeChirho = process.argv.includes('--production-chirho');
const workersDevProbeChirho = process.argv.includes('--workers-dev-chirho');
if (productionProbeChirho && workersDevProbeChirho)
	throw new Error('Select one hosted playback target');
if (
	productionProbeChirho
		? previewUrlChirho.protocol !== 'https:' || previewUrlChirho.hostname !== 'audiobiblerad.io'
		: workersDevProbeChirho
			? previewUrlChirho.protocol !== 'https:' ||
				previewUrlChirho.hostname !== 'audiobiblerad-io-chirho.lovejesus.workers.dev'
			: !['127.0.0.1', 'localhost', '[::1]'].includes(previewUrlChirho.hostname)
)
	throw new Error(
		"Use a local preview, or explicitly select one of this project's hosted probe targets."
	);
const languagesProbeChirho = process.argv.includes('--languages-chirho');
const experienceProbeChirho = process.argv.includes('--experience-chirho');
const evidenceDirectoryChirho = new URL(
	productionProbeChirho || workersDevProbeChirho
		? '../spec-chirho/evidence-chirho/web-release-chirho/playback-chirho/'
		: experienceProbeChirho
			? '../spec-chirho/evidence-chirho/radio-experience-chirho/'
			: languagesProbeChirho
				? '../spec-chirho/evidence-chirho/language-radio-chirho/'
				: '../spec-chirho/evidence-chirho/web-radio-chirho/',
	import.meta.url
);
mkdirSync(evidenceDirectoryChirho, { recursive: true });
const renderDirectoryChirho = new URL('./renders-chirho/', evidenceDirectoryChirho);
mkdirSync(renderDirectoryChirho, { recursive: true });
const formattingChirho = await resolveConfigChirho(
	new URL('live_playback_chirho.json', evidenceDirectoryChirho).pathname
);
async function writeEvidenceChirho(filenameChirho: string, valueChirho: unknown): Promise<void> {
	writeFileSync(
		new URL(filenameChirho, evidenceDirectoryChirho),
		await formatChirho(JSON.stringify(valueChirho), { ...formattingChirho, parser: 'json' })
	);
}
const browserChirho = await chromium.launch({ headless: true });
const contextChirho = await browserChirho.newContext({ viewport: { width: 1280, height: 1000 } });
const pageChirho = await contextChirho.newPage();
const progressChirho: Array<{
	url_chirho: string;
	seconds_chirho: number;
	credit_chirho: string;
	notice_links_chirho: string[];
}> = [];
async function verifyProgressChirho(): Promise<void> {
	const baselineChirho = await pageChirho.evaluate(() => {
		const elementsChirho = (
			window as unknown as { liveRadioProbeChirho: { elements_chirho: HTMLAudioElement[] } }
		).liveRadioProbeChirho.elements_chirho;
		const audioChirho = elementsChirho.find(
			(audioChirho) =>
				!audioChirho.paused &&
				audioChirho.currentSrc.startsWith('https://') &&
				new URL(audioChirho.currentSrc).origin !== location.origin
		);
		if (!audioChirho) throw new Error('No active Scripture stream');
		return {
			url_chirho: audioChirho.currentSrc,
			seconds_chirho: audioChirho.currentTime,
			credit_chirho: document.querySelector('.credit-chirho > p')?.textContent?.trim() ?? '',
			notice_links_chirho: Array.from(
				document.querySelectorAll<HTMLAnchorElement>('.credit-chirho a')
			).map((linkChirho) => linkChirho.href)
		};
	});
	if (!baselineChirho.credit_chirho || baselineChirho.notice_links_chirho.length !== 2)
		throw new Error('The playing recording is missing its visible credit or source/licence links');
	await pageChirho.waitForFunction(
		(baselineChirho) => {
			const elementsChirho = (
				window as unknown as { liveRadioProbeChirho: { elements_chirho: HTMLAudioElement[] } }
			).liveRadioProbeChirho.elements_chirho;
			return elementsChirho.some(
				(audioChirho) =>
					audioChirho.currentSrc === baselineChirho.url_chirho &&
					!audioChirho.paused &&
					audioChirho.currentTime >= baselineChirho.seconds_chirho + 0.12
			);
		},
		baselineChirho,
		{ timeout: 5000 }
	);
	progressChirho.push(baselineChirho);
}
const errorsChirho: string[] = [];
const networkChirho: Array<{
	url_chirho: string;
	status_chirho?: number;
	failure_chirho?: string;
}> = [];
pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
pageChirho.on('requestfailed', (requestChirho) => {
	if (requestChirho.url().startsWith('https://'))
		networkChirho.push({
			url_chirho: requestChirho.url(),
			failure_chirho: requestChirho.failure()?.errorText
		});
});
pageChirho.on('response', (responseChirho) => {
	if (responseChirho.url().endsWith('.mp3'))
		networkChirho.push({
			url_chirho: responseChirho.url(),
			status_chirho: responseChirho.status()
		});
});

try {
	await pageChirho.addInitScript(() => {
		Object.defineProperty(navigator, 'getAutoplayPolicy', { value: () => 'disallowed' });
		const elementsChirho: HTMLAudioElement[] = [];
		const gesturesChirho: Array<{ at_ms_chirho: number; control_chirho: string }> = [];
		const playingChirho: Array<{
			at_ms_chirho: number;
			url_chirho: string;
			seconds_chirho: number;
			duration_chirho: number;
			muted_chirho: boolean;
			volume_chirho: number;
		}> = [];
		Object.assign(window, {
			liveRadioProbeChirho: {
				elements_chirho: elementsChirho,
				gestures_chirho: gesturesChirho,
				playing_chirho: playingChirho
			}
		});
		document.addEventListener(
			'click',
			(eventChirho) => {
				const buttonChirho =
					eventChirho.target instanceof Element ? eventChirho.target.closest('button') : null;
				if (buttonChirho)
					gesturesChirho.push({
						at_ms_chirho: performance.now(),
						control_chirho:
							buttonChirho.getAttribute('aria-label') ?? buttonChirho.textContent?.trim() ?? ''
					});
			},
			true
		);
		document.addEventListener(
			'change',
			(eventChirho) => {
				const selectChirho = eventChirho.target;
				if (selectChirho instanceof HTMLSelectElement)
					gesturesChirho.push({
						at_ms_chirho: performance.now(),
						control_chirho: selectChirho.getAttribute('aria-label') ?? ''
					});
			},
			true
		);
		window.Audio = new Proxy(window.Audio, {
			construct(targetChirho, argumentsChirho) {
				const audioChirho = Reflect.construct(targetChirho, argumentsChirho) as HTMLAudioElement;
				elementsChirho.push(audioChirho);
				audioChirho.addEventListener('playing', () => {
					if (
						audioChirho.currentSrc.startsWith('https://') &&
						new URL(audioChirho.currentSrc).origin !== location.origin
					)
						playingChirho.push({
							at_ms_chirho: performance.now(),
							url_chirho: audioChirho.currentSrc,
							seconds_chirho: audioChirho.currentTime,
							duration_chirho: audioChirho.duration,
							muted_chirho: audioChirho.muted,
							volume_chirho: audioChirho.volume
						});
				});
				return audioChirho;
			}
		});
	});
	await pageChirho.goto(previewUrlChirho.href);
	await pageChirho.getByRole('button', { name: 'Radio power', exact: true }).click();
	const waitForStreamsChirho = async (countChirho: number): Promise<void> => {
		await pageChirho.waitForFunction(
			(countChirho) => {
				const traceChirho = (
					window as unknown as {
						liveRadioProbeChirho: { playing_chirho: Array<{ url_chirho: string }> };
					}
				).liveRadioProbeChirho;
				return (
					new Set(traceChirho.playing_chirho.map((eventChirho) => eventChirho.url_chirho)).size >=
					countChirho
				);
			},
			countChirho,
			{ timeout: 20000 }
		);
		await verifyProgressChirho();
	};
	await waitForStreamsChirho(1);
	await pageChirho.getByRole('button', { name: 'Next station', exact: true }).click();
	await waitForStreamsChirho(2);
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('hi');
	await waitForStreamsChirho(3);
	if (languagesProbeChirho) {
		await pageChirho
			.getByRole('combobox', { name: 'Version', exact: true })
			.selectOption({ label: 'Unlocked Literal Bible' });
		await pageChirho
			.getByRole('combobox', { name: 'Narration', exact: true })
			.selectOption('biel-ulb-hi');
		await waitForStreamsChirho(4);
	}
	await pageChirho.getByRole('combobox', { name: 'Language', exact: true }).selectOption('es');
	await waitForStreamsChirho(languagesProbeChirho ? 5 : 4);
	const traceChirho = await pageChirho.evaluate(() => {
		const traceChirho = (
			window as unknown as {
				liveRadioProbeChirho: {
					elements_chirho: HTMLAudioElement[];
					gestures_chirho: Array<{ at_ms_chirho: number; control_chirho: string }>;
					playing_chirho: Array<{
						at_ms_chirho: number;
						url_chirho: string;
						seconds_chirho: number;
						duration_chirho: number;
						muted_chirho: boolean;
						volume_chirho: number;
					}>;
				};
			}
		).liveRadioProbeChirho;
		return {
			gestures_chirho: traceChirho.gestures_chirho,
			playing_chirho: traceChirho.playing_chirho,
			element_count_chirho: traceChirho.elements_chirho.length,
			active_chirho: traceChirho.elements_chirho
				.filter((audioChirho) => !audioChirho.paused)
				.map((audioChirho) => audioChirho.currentSrc),
			viewport_fits_chirho: document.documentElement.scrollWidth <= window.innerWidth
		};
	});
	const seenChirho = new Set<string>();
	const measurementsChirho = traceChirho.playing_chirho
		.filter((eventChirho) => {
			if (seenChirho.has(eventChirho.url_chirho)) return false;
			seenChirho.add(eventChirho.url_chirho);
			return true;
		})
		.map((eventChirho) => {
			const gestureChirho = traceChirho.gestures_chirho
				.filter((gestureChirho) => gestureChirho.at_ms_chirho <= eventChirho.at_ms_chirho)
				.at(-1);
			return {
				...eventChirho,
				control_chirho: gestureChirho?.control_chirho,
				gesture_to_playing_ms_chirho: gestureChirho
					? Math.round((eventChirho.at_ms_chirho - gestureChirho.at_ms_chirho) * 10) / 10
					: null
			};
		});
	const resultChirho = {
		measured_on_chirho: new Date().toISOString(),
		browser_chirho: `Chromium ${browserChirho.version()}`,
		preview_chirho: previewUrlChirho.href,
		method_chirho:
			'Actual upstream streams, no media interception. Policy detection is held disallowed so this probe measures explicit On and control changes. Browser playing event; not an acoustic or physical-device latency measurement.',
		navigation_to_first_playing_ms_chirho: Math.round(measurementsChirho[0].at_ms_chirho * 10) / 10,
		progress_verified_chirho: progressChirho,
		measurements_chirho: measurementsChirho,
		trace_chirho: traceChirho,
		errors_chirho: errorsChirho
	};
	await writeEvidenceChirho(
		workersDevProbeChirho ? 'workers_dev_live_playback_chirho.json' : 'live_playback_chirho.json',
		resultChirho
	);
	await pageChirho.screenshot({
		path: new URL(
			workersDevProbeChirho
				? 'workers_dev_desktop_chirho.png'
				: languagesProbeChirho
					? 'live_desktop_chirho.png'
					: 'pass_3_desktop_chirho.png',
			renderDirectoryChirho
		).pathname,
		fullPage: true
	});
	await pageChirho.setViewportSize({ width: 390, height: 844 });
	await pageChirho.screenshot({
		path: new URL(
			workersDevProbeChirho
				? 'workers_dev_mobile_chirho.png'
				: languagesProbeChirho
					? 'live_mobile_chirho.png'
					: 'pass_3_mobile_chirho.png',
			renderDirectoryChirho
		).pathname,
		fullPage: true
	});
	if (
		measurementsChirho.length !== (languagesProbeChirho ? 5 : 4) ||
		errorsChirho.length ||
		traceChirho.element_count_chirho !== 2 ||
		traceChirho.active_chirho.length !== 1 ||
		!traceChirho.active_chirho[0].startsWith('https://') ||
		!traceChirho.viewport_fits_chirho ||
		measurementsChirho.some(
			(eventChirho) =>
				eventChirho.muted_chirho ||
				eventChirho.volume_chirho <= 0 ||
				eventChirho.duration_chirho <= 0
		)
	)
		throw new Error('The live playback proof did not pass; inspect the saved evidence.');
	console.log(
		JSON.stringify({
			outcome_chirho: 'PASS',
			navigation_to_first_playing_ms_chirho: resultChirho.navigation_to_first_playing_ms_chirho,
			gesture_to_playing_ms_chirho: measurementsChirho.map(
				(eventChirho) => eventChirho.gesture_to_playing_ms_chirho
			)
		})
	);
} catch (errorChirho) {
	const failureChirho = {
		outcome_chirho: 'FAIL',
		measured_on_chirho: new Date().toISOString(),
		error_chirho: errorChirho instanceof Error ? errorChirho.message : String(errorChirho),
		network_chirho: networkChirho,
		errors_chirho: errorsChirho,
		media_chirho: await pageChirho.evaluate(() => {
			const traceChirho = (
				window as unknown as {
					liveRadioProbeChirho?: { elements_chirho: HTMLAudioElement[]; playing_chirho: unknown[] };
				}
			).liveRadioProbeChirho;
			return {
				playing_chirho: traceChirho?.playing_chirho,
				elements_chirho: traceChirho?.elements_chirho.map((audioChirho) => ({
					url_chirho: audioChirho.currentSrc,
					ready_state_chirho: audioChirho.readyState,
					error_chirho: audioChirho.error?.message,
					paused_chirho: audioChirho.paused
				})),
				status_chirho: document.querySelector('[role="status"]')?.textContent
			};
		})
	};
	await writeEvidenceChirho(
		workersDevProbeChirho ? 'workers_dev_live_failure_chirho.json' : 'live_failure_chirho.json',
		failureChirho
	);
	console.log(JSON.stringify(failureChirho));
	throw errorChirho;
} finally {
	await contextChirho.close();
	await browserChirho.close();
}
