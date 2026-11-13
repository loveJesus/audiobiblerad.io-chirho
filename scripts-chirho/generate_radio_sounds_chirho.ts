// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
const SAMPLE_RATE_CHIRHO = 22_050;
const EFFECT_GAIN_CHIRHO = 0.18;
const outputDirectoryChirho = new URL('../static/sounds-chirho/', import.meta.url);
const checkOnlyChirho = process.argv.includes('--check');
mkdirSync(outputDirectoryChirho, { recursive: true });

function synthesizeChirho(variantChirho: number): Buffer {
	const durationChirho = 0.42 + (variantChirho % 3) * 0.09;
	const sampleCountChirho = Math.floor(durationChirho * SAMPLE_RATE_CHIRHO);
	const bufferChirho = Buffer.alloc(44 + sampleCountChirho * 2);
	bufferChirho.write('RIFF', 0);
	bufferChirho.writeUInt32LE(bufferChirho.length - 8, 4);
	bufferChirho.write('WAVEfmt ', 8);
	bufferChirho.writeUInt32LE(16, 16);
	bufferChirho.writeUInt16LE(1, 20);
	bufferChirho.writeUInt16LE(1, 22);
	bufferChirho.writeUInt32LE(SAMPLE_RATE_CHIRHO, 24);
	bufferChirho.writeUInt32LE(SAMPLE_RATE_CHIRHO * 2, 28);
	bufferChirho.writeUInt16LE(2, 32);
	bufferChirho.writeUInt16LE(16, 34);
	bufferChirho.write('data', 36);
	bufferChirho.writeUInt32LE(sampleCountChirho * 2, 40);
	let seedChirho = 0x316 + variantChirho * 7919;
	let previousNoiseChirho = 0;
	let phaseChirho = 0;
	for (let indexChirho = 0; indexChirho < sampleCountChirho; indexChirho += 1) {
		seedChirho = (Math.imul(seedChirho, 1_664_525) + 1_013_904_223) >>> 0;
		const noiseChirho = seedChirho / 0x80000000 - 1;
		const timeChirho = indexChirho / SAMPLE_RATE_CHIRHO;
		const progressChirho = timeChirho / durationChirho;
		const envelopeChirho = Math.min(1, timeChirho / 0.012, (durationChirho - timeChirho) / 0.035);
		const sweepChirho =
			260 + variantChirho * 83 + progressChirho * (variantChirho % 2 ? 1000 : -180);
		phaseChirho += (Math.PI * 2 * sweepChirho) / SAMPLE_RATE_CHIRHO;
		const gateChirho = Math.sin(timeChirho * Math.PI * (18 + variantChirho * 3)) > 0 ? 1 : 0.18;
		const hissChirho = (noiseChirho - previousNoiseChirho) * 0.18;
		const toneChirho = Math.sin(phaseChirho) * (variantChirho % 3 === 1 ? 0.28 : 0.07);
		const clickChirho = Math.exp(-((progressChirho - 0.25) ** 2) * 5000) * noiseChirho * 0.5;
		const sampleChirho = Math.max(
			-0.85,
			Math.min(
				0.85,
				(hissChirho * gateChirho + toneChirho * gateChirho + clickChirho) * envelopeChirho
			)
		);
		bufferChirho.writeInt16LE(
			Math.round(sampleChirho * EFFECT_GAIN_CHIRHO * 32767),
			44 + indexChirho * 2
		);
		previousNoiseChirho = noiseChirho;
	}
	return bufferChirho;
}

let totalBytesChirho = 0;
for (let variantChirho = 0; variantChirho < 9; variantChirho += 1) {
	const filenameChirho = `radio_${String(variantChirho + 1).padStart(2, '0')}_chirho.wav`;
	const pathChirho = new URL(filenameChirho, outputDirectoryChirho);
	const bytesChirho = synthesizeChirho(variantChirho);
	if (checkOnlyChirho) {
		if (!readFileSync(pathChirho).equals(bytesChirho))
			throw new Error(`Sound differs: ${filenameChirho}`);
	} else {
		writeFileSync(pathChirho, bytesChirho);
	}
	totalBytesChirho += bytesChirho.length;
}
console.log(
	`${checkOnlyChirho ? 'Verified' : 'Generated'} 9 original mono WAV sounds, ${totalBytesChirho} bytes.`
);
