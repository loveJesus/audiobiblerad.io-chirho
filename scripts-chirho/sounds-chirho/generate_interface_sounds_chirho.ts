// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Writes the open click and knob sounds: two tiny recordings synthesised from fixed numbers, with
// no recorded or downloaded audio as input, dedicated to the public domain (CC0) like the nine
// tuning sounds. See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
//   bun scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts
//   bun scripts-chirho/sounds-chirho/generate_interface_sounds_chirho.ts --check-chirho
//
// --check-chirho rebuilds them in memory and fails if the files in the repository differ.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { encodePcmWavChirho } from '../../src/lib/sounds-chirho/wav_chirho';

const SAMPLE_RATE_CHIRHO = 22_050;
/** The loudest sample of each sound, as a share of full scale: under the 0.16 limit for effects. */
const PEAK_CHIRHO = 0.12;
const FADE_SECONDS_CHIRHO = 0.004;
const OUTPUT_DIR_CHIRHO = new URL('../../static/sounds-chirho/interface-chirho/', import.meta.url);

/** One mechanical contact: a burst of bright noise, a ringing tone and, for a button, a low body. */
interface ImpactChirho {
	at_seconds_chirho: number;
	gain_chirho: number;
	noise_decay_seconds_chirho: number;
	ring_hz_chirho: number;
	ring_decay_seconds_chirho: number;
	body_hz_chirho?: number;
	body_decay_seconds_chirho?: number;
}

interface InterfaceSoundChirho {
	file_chirho: string;
	seconds_chirho: number;
	seed_chirho: number;
	impacts_chirho: readonly ImpactChirho[];
}

const SOUNDS_CHIRHO: readonly InterfaceSoundChirho[] = [
	{
		// A button: the press, then its release a moment later.
		file_chirho: 'click_chirho.wav',
		seconds_chirho: 0.14,
		seed_chirho: 316,
		impacts_chirho: [
			{
				at_seconds_chirho: 0.004,
				gain_chirho: 1,
				noise_decay_seconds_chirho: 0.0018,
				ring_hz_chirho: 2100,
				ring_decay_seconds_chirho: 0.006,
				body_hz_chirho: 160,
				body_decay_seconds_chirho: 0.014
			},
			{
				at_seconds_chirho: 0.078,
				gain_chirho: 0.5,
				noise_decay_seconds_chirho: 0.0014,
				ring_hz_chirho: 2600,
				ring_decay_seconds_chirho: 0.005
			}
		]
	},
	{
		// One detent of a knob: a short bright tick with a faint second contact.
		file_chirho: 'knob_chirho.wav',
		seconds_chirho: 0.05,
		seed_chirho: 3,
		impacts_chirho: [
			{
				at_seconds_chirho: 0.002,
				gain_chirho: 1,
				noise_decay_seconds_chirho: 0.0011,
				ring_hz_chirho: 3300,
				ring_decay_seconds_chirho: 0.0035
			},
			{
				at_seconds_chirho: 0.011,
				gain_chirho: 0.3,
				noise_decay_seconds_chirho: 0.0009,
				ring_hz_chirho: 2900,
				ring_decay_seconds_chirho: 0.003
			}
		]
	}
];

/** A small fixed-seed generator (mulberry32), so every run writes the same bytes. */
function randomFromSeedChirho(seedChirho: number): () => number {
	let stateChirho = seedChirho >>> 0;
	return () => {
		stateChirho = (stateChirho + 0x6d2b79f5) >>> 0;
		let valueChirho = stateChirho;
		valueChirho = Math.imul(valueChirho ^ (valueChirho >>> 15), valueChirho | 1);
		valueChirho ^= valueChirho + Math.imul(valueChirho ^ (valueChirho >>> 7), valueChirho | 61);
		return ((valueChirho ^ (valueChirho >>> 14)) >>> 0) / 4294967296;
	};
}

function synthesizeChirho(soundChirho: InterfaceSoundChirho): Uint8Array {
	const countChirho = Math.round(soundChirho.seconds_chirho * SAMPLE_RATE_CHIRHO);
	const mixChirho = new Float64Array(countChirho);
	const randomChirho = randomFromSeedChirho(soundChirho.seed_chirho);
	for (const impactChirho of soundChirho.impacts_chirho) {
		const firstChirho = Math.round(impactChirho.at_seconds_chirho * SAMPLE_RATE_CHIRHO);
		let previousNoiseChirho = 0;
		for (let indexChirho = firstChirho; indexChirho < countChirho; indexChirho += 1) {
			const secondsChirho = (indexChirho - firstChirho) / SAMPLE_RATE_CHIRHO;
			const whiteChirho = randomChirho() * 2 - 1;
			// Differencing white noise tilts it bright, like a hard contact.
			const noiseChirho = whiteChirho - previousNoiseChirho;
			previousNoiseChirho = whiteChirho;
			let sampleChirho =
				0.5 * noiseChirho * Math.exp(-secondsChirho / impactChirho.noise_decay_seconds_chirho) +
				Math.sin(2 * Math.PI * impactChirho.ring_hz_chirho * secondsChirho) *
					Math.exp(-secondsChirho / impactChirho.ring_decay_seconds_chirho);
			if (impactChirho.body_hz_chirho && impactChirho.body_decay_seconds_chirho)
				sampleChirho +=
					0.6 *
					Math.sin(2 * Math.PI * impactChirho.body_hz_chirho * secondsChirho) *
					Math.exp(-secondsChirho / impactChirho.body_decay_seconds_chirho);
			mixChirho[indexChirho] += impactChirho.gain_chirho * sampleChirho;
		}
	}
	// A short fade, so each sound ends at silence rather than on a cut.
	const fadeChirho = Math.round(FADE_SECONDS_CHIRHO * SAMPLE_RATE_CHIRHO);
	for (let stepChirho = 0; stepChirho < fadeChirho; stepChirho += 1)
		mixChirho[countChirho - 1 - stepChirho] *= stepChirho / fadeChirho;
	const loudestChirho = mixChirho.reduce(
		(largestChirho, valueChirho) => Math.max(largestChirho, Math.abs(valueChirho)),
		0
	);
	const scaleChirho = (PEAK_CHIRHO * 32767) / loudestChirho;
	return encodePcmWavChirho(
		Int16Array.from(mixChirho, (valueChirho) => Math.round(valueChirho * scaleChirho)),
		SAMPLE_RATE_CHIRHO
	);
}

const checkOnlyChirho = process.argv.includes('--check-chirho');
let differsChirho = false;
if (!checkOnlyChirho) mkdirSync(OUTPUT_DIR_CHIRHO, { recursive: true });
for (const soundChirho of SOUNDS_CHIRHO) {
	const bytesChirho = synthesizeChirho(soundChirho);
	const targetChirho = new URL(soundChirho.file_chirho, OUTPUT_DIR_CHIRHO);
	if (!checkOnlyChirho) writeFileSync(targetChirho, bytesChirho);
	else if (
		!existsSync(targetChirho) ||
		Buffer.compare(readFileSync(targetChirho), Buffer.from(bytesChirho)) !== 0
	) {
		differsChirho = true;
		console.error(`${soundChirho.file_chirho} differs from its generator`);
	}
}
if (differsChirho) process.exitCode = 1;
else
	console.log(
		checkOnlyChirho ? 'interface sounds match their generator' : 'interface sounds written'
	);
