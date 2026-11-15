// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { Page, Frame } from '@playwright/test';

export interface MediaEventChirho {
	sequence_chirho: number;
	at_ms_chirho: number;
	element_index_chirho: number;
	kind_chirho: string;
	url_chirho: string;
	requested_url_chirho: string | null;
	seconds_chirho: number;
	duration_chirho: number | null;
	paused_chirho: boolean;
	ended_chirho: boolean;
	has_source_chirho: boolean;
	error_code_chirho: number | null;
	rejection_name_chirho: string | null;
}

// A tiny generated test tone exercises the real browser decoder without copying Scripture.
export function fixtureWaveChirho(durationChirho = 15): Buffer {
	const sampleRateChirho = 8000;
	const sampleCountChirho = Math.round(sampleRateChirho * durationChirho);
	const bytesChirho = Buffer.alloc(44 + sampleCountChirho * 2);
	bytesChirho.write('RIFF', 0);
	bytesChirho.writeUInt32LE(bytesChirho.length - 8, 4);
	bytesChirho.write('WAVEfmt ', 8);
	bytesChirho.writeUInt32LE(16, 16);
	bytesChirho.writeUInt16LE(1, 20);
	bytesChirho.writeUInt16LE(1, 22);
	bytesChirho.writeUInt32LE(sampleRateChirho, 24);
	bytesChirho.writeUInt32LE(sampleRateChirho * 2, 28);
	bytesChirho.writeUInt16LE(2, 32);
	bytesChirho.writeUInt16LE(16, 34);
	bytesChirho.write('data', 36);
	bytesChirho.writeUInt32LE(sampleCountChirho * 2, 40);
	for (let indexChirho = 0; indexChirho < sampleCountChirho; indexChirho += 1)
		bytesChirho.writeInt16LE(
			Math.round(Math.sin((indexChirho / sampleRateChirho) * Math.PI * 2 * 220) * 30),
			44 + indexChirho * 2
		);
	return bytesChirho;
}

export async function observeMediaChirho(
	pageChirho: Page,
	policyChirho = 'disallowed'
): Promise<void> {
	await pageChirho.addInitScript((policyChirho) => {
		Object.defineProperty(navigator, 'getAutoplayPolicy', {
			configurable: true,
			value: () => policyChirho
		});
		const audioElementsChirho: HTMLAudioElement[] = [];
		const audioLoadCountsChirho = new WeakMap<HTMLAudioElement, number>();
		const audioPlayCountsChirho = new WeakMap<HTMLAudioElement, number>();
		const audioEventsChirho: MediaEventChirho[] = [];
		let sequenceChirho = 0;
		Object.assign(window, {
			audioElementsChirho,
			audioLoadCountsChirho,
			audioPlayCountsChirho,
			audioEventsChirho
		});
		window.Audio = new Proxy(window.Audio, {
			construct(targetChirho, argumentsChirho) {
				const audioChirho = Reflect.construct(targetChirho, argumentsChirho) as HTMLAudioElement;
				const elementIndexChirho = audioElementsChirho.length;
				audioElementsChirho.push(audioChirho);
				const recordChirho = (
					kindChirho: string,
					requestedUrlChirho: string | null = null,
					rejectionNameChirho: string | null = null
				): void => {
					if (audioEventsChirho.length >= 256) audioEventsChirho.shift();
					audioEventsChirho.push({
						sequence_chirho: ++sequenceChirho,
						at_ms_chirho: performance.now(),
						element_index_chirho: elementIndexChirho,
						kind_chirho: kindChirho,
						url_chirho: audioChirho.currentSrc || audioChirho.src,
						requested_url_chirho: requestedUrlChirho,
						seconds_chirho: audioChirho.currentTime,
						duration_chirho: Number.isFinite(audioChirho.duration) ? audioChirho.duration : null,
						paused_chirho: audioChirho.paused,
						ended_chirho: audioChirho.ended,
						has_source_chirho: audioChirho.hasAttribute('src'),
						error_code_chirho: audioChirho.error?.code ?? null,
						rejection_name_chirho: rejectionNameChirho
					});
				};
				for (const kindChirho of [
					'play',
					'playing',
					'pause',
					'ended',
					'emptied',
					'loadedmetadata',
					'error'
				])
					audioChirho.addEventListener(kindChirho, () => recordChirho(kindChirho));
				const loadChirho = audioChirho.load.bind(audioChirho);
				const playChirho = audioChirho.play.bind(audioChirho);
				const removeAttributeChirho = audioChirho.removeAttribute.bind(audioChirho);
				audioChirho.removeAttribute = (nameChirho) => {
					if (nameChirho === 'src') recordChirho('release_source_chirho');
					removeAttributeChirho(nameChirho);
				};
				audioChirho.play = () => {
					audioPlayCountsChirho.set(audioChirho, (audioPlayCountsChirho.get(audioChirho) ?? 0) + 1);
					const requestedUrlChirho = audioChirho.src;
					recordChirho('play_call_chirho', requestedUrlChirho);
					const resultChirho = playChirho();
					void resultChirho.then(
						() => recordChirho('play_resolved_chirho', requestedUrlChirho),
						(errorChirho: unknown) =>
							recordChirho(
								'play_rejected_chirho',
								requestedUrlChirho,
								errorChirho instanceof DOMException ? errorChirho.name : 'Error'
							)
					);
					return resultChirho;
				};
				audioChirho.load = () => {
					audioLoadCountsChirho.set(audioChirho, (audioLoadCountsChirho.get(audioChirho) ?? 0) + 1);
					recordChirho('load_call_chirho');
					loadChirho();
				};
				return audioChirho;
			}
		});
	}, policyChirho);
}

/** Event history survives short effects and source release; it is bounded to the latest 256 events. */
export async function mediaEventsChirho(
	pageChirho: Page | Frame
): Promise<readonly MediaEventChirho[]> {
	return pageChirho.evaluate(
		() => (window as unknown as { audioEventsChirho: MediaEventChirho[] }).audioEventsChirho
	);
}

export async function mediaStateChirho(pageChirho: Page | Frame) {
	return pageChirho.evaluate(() => {
		const elementsChirho = (window as unknown as { audioElementsChirho: HTMLAudioElement[] })
			.audioElementsChirho;
		return elementsChirho.map((audioChirho) => ({
			url_chirho: audioChirho.currentSrc,
			paused_chirho: audioChirho.paused,
			seconds_chirho: audioChirho.currentTime,
			volume_chirho: audioChirho.volume,
			muted_chirho: audioChirho.muted,
			duration_chirho: audioChirho.duration
		}));
	});
}
