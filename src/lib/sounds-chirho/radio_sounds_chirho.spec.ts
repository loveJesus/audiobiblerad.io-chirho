// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('portable tuning sound level', () => {
	it('keeps all nine PCM files quiet even when the device ignores software volume', () => {
		for (let variantChirho = 1; variantChirho <= 9; variantChirho += 1) {
			const bytesChirho = readFileSync(
				new URL(
					`../../../static/sounds-chirho/radio_${String(variantChirho).padStart(2, '0')}_chirho.wav`,
					import.meta.url
				)
			);
			let peakChirho = 0;
			for (let offsetChirho = 44; offsetChirho < bytesChirho.length; offsetChirho += 2)
				peakChirho = Math.max(peakChirho, Math.abs(bytesChirho.readInt16LE(offsetChirho)));
			expect(peakChirho).toBeGreaterThan(0);
			expect(peakChirho / 32767).toBeLessThanOrEqual(0.16);
		}
	});
});
