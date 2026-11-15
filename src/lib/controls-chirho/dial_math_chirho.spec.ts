// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { angleDeltaChirho, dialAngleChirho, nearestDialOptionChirho } from './dial_math_chirho';

describe('rotary selection', () => {
	it('points from the beginning to the end and clamps outside that range', () => {
		expect(dialAngleChirho(1, 1, 21)).toBe(-135);
		expect(dialAngleChirho(11, 1, 21)).toBe(0);
		expect(dialAngleChirho(21, 1, 21)).toBe(135);
		expect(dialAngleChirho(-10, 1, 21)).toBe(-135);
		expect(dialAngleChirho(1000, 1, 21)).toBe(135);
		expect(dialAngleChirho(1, 1, 1)).toBe(0);
	});
	it('turns continuously through the angular seam instead of jumping a whole turn', () => {
		expect(angleDeltaChirho(179, -179)).toBe(2);
		expect(angleDeltaChirho(-179, 179)).toBe(-2);
	});
	it('skips unavailable chapters in the direction of a turn', () => {
		const optionsChirho = [1, 2, 4, 7].map((valueChirho) => ({
			value_chirho: valueChirho,
			label_chirho: String(valueChirho)
		}));
		expect(nearestDialOptionChirho(optionsChirho, 3, 1)).toBe(4);
		expect(nearestDialOptionChirho(optionsChirho, 3, -1)).toBe(2);
		expect(nearestDialOptionChirho(optionsChirho, 6, 1)).toBe(7);
	});
});
