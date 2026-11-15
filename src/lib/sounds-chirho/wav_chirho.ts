// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Small 16-bit PCM WAV helpers for the sound scripts and their tests. They use only typed
// arrays, so they run anywhere. See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.

/**
 * The loudest any effect may be, as a share of full scale. Phones may ignore an element's software
 * volume, so an effect's quietness has to live in its samples.
 */
export const SOUND_PEAK_LIMIT_CHIRHO = 0.16;

export interface PcmWavChirho {
	readonly sample_rate_chirho: number;
	readonly channels_chirho: number;
	/** Interleaved samples. */
	readonly samples_chirho: Int16Array;
}

function writeTagChirho(viewChirho: DataView, offsetChirho: number, tagChirho: string): void {
	for (let indexChirho = 0; indexChirho < 4; indexChirho += 1)
		viewChirho.setUint8(offsetChirho + indexChirho, tagChirho.charCodeAt(indexChirho));
}

function readTagChirho(viewChirho: DataView, offsetChirho: number): string {
	let tagChirho = '';
	for (let indexChirho = 0; indexChirho < 4; indexChirho += 1)
		tagChirho += String.fromCharCode(viewChirho.getUint8(offsetChirho + indexChirho));
	return tagChirho;
}

/** A mono 16-bit PCM WAV file holding the given samples. */
export function encodePcmWavChirho(
	samplesChirho: Int16Array,
	sampleRateChirho: number
): Uint8Array {
	const dataBytesChirho = samplesChirho.length * 2;
	const bytesChirho = new Uint8Array(44 + dataBytesChirho);
	const viewChirho = new DataView(bytesChirho.buffer);
	writeTagChirho(viewChirho, 0, 'RIFF');
	viewChirho.setUint32(4, 36 + dataBytesChirho, true);
	writeTagChirho(viewChirho, 8, 'WAVE');
	writeTagChirho(viewChirho, 12, 'fmt ');
	viewChirho.setUint32(16, 16, true);
	viewChirho.setUint16(20, 1, true);
	viewChirho.setUint16(22, 1, true);
	viewChirho.setUint32(24, sampleRateChirho, true);
	viewChirho.setUint32(28, sampleRateChirho * 2, true);
	viewChirho.setUint16(32, 2, true);
	viewChirho.setUint16(34, 16, true);
	writeTagChirho(viewChirho, 36, 'data');
	viewChirho.setUint32(40, dataBytesChirho, true);
	samplesChirho.forEach((sampleChirho, indexChirho) =>
		viewChirho.setInt16(44 + indexChirho * 2, sampleChirho, true)
	);
	return bytesChirho;
}

/**
 * Reads a 16-bit PCM WAV file by walking its chunks, so files from other tools, with extra chunks,
 * read correctly. Anything else throws.
 */
export function decodePcmWavChirho(bytesChirho: Uint8Array): PcmWavChirho {
	const viewChirho = new DataView(
		bytesChirho.buffer,
		bytesChirho.byteOffset,
		bytesChirho.byteLength
	);
	if (
		bytesChirho.byteLength < 12 ||
		readTagChirho(viewChirho, 0) !== 'RIFF' ||
		readTagChirho(viewChirho, 8) !== 'WAVE'
	)
		throw new Error('not a WAV file');
	let formatChirho: { channels_chirho: number; sample_rate_chirho: number } | null = null;
	let offsetChirho = 12;
	while (offsetChirho + 8 <= bytesChirho.byteLength) {
		const tagChirho = readTagChirho(viewChirho, offsetChirho);
		const sizeChirho = viewChirho.getUint32(offsetChirho + 4, true);
		const bodyChirho = offsetChirho + 8;
		if (bodyChirho + sizeChirho > bytesChirho.byteLength)
			throw new Error(`WAV chunk ${tagChirho} runs past the end of the file`);
		if (tagChirho === 'fmt ') {
			if (sizeChirho < 16) throw new Error('WAV format chunk is too short');
			const codingChirho = viewChirho.getUint16(bodyChirho, true);
			const bitsChirho = viewChirho.getUint16(bodyChirho + 14, true);
			if (codingChirho !== 1 || bitsChirho !== 16) throw new Error('WAV is not 16-bit PCM');
			formatChirho = {
				channels_chirho: viewChirho.getUint16(bodyChirho + 2, true),
				sample_rate_chirho: viewChirho.getUint32(bodyChirho + 4, true)
			};
		} else if (tagChirho === 'data') {
			if (!formatChirho) throw new Error('WAV data comes before its format');
			const samplesChirho = new Int16Array(Math.floor(sizeChirho / 2));
			for (let indexChirho = 0; indexChirho < samplesChirho.length; indexChirho += 1)
				samplesChirho[indexChirho] = viewChirho.getInt16(bodyChirho + indexChirho * 2, true);
			return { ...formatChirho, samples_chirho: samplesChirho };
		}
		offsetChirho = bodyChirho + sizeChirho + (sizeChirho % 2);
	}
	throw new Error('WAV has no data chunk');
}

/** The loudest sample, as a share of full scale. */
export function peakOfChirho(wavChirho: PcmWavChirho): number {
	let peakChirho = 0;
	for (const sampleChirho of wavChirho.samples_chirho)
		peakChirho = Math.max(peakChirho, Math.abs(sampleChirho));
	return peakChirho / 32767;
}
