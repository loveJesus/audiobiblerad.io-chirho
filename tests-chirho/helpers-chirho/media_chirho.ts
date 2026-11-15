// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { Page } from '@playwright/test';

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
		Object.assign(window, { audioElementsChirho });
		window.Audio = new Proxy(window.Audio, {
			construct(targetChirho, argumentsChirho) {
				const audioChirho = Reflect.construct(targetChirho, argumentsChirho) as HTMLAudioElement;
				audioElementsChirho.push(audioChirho);
				return audioChirho;
			}
		});
	}, policyChirho);
}

export async function mediaStateChirho(pageChirho: Page) {
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
