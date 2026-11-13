// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { BOOKS_CHIRHO, findBookChirho, isBookIdChirho } from './books_chirho';

describe('the book table', () => {
	it('holds the 66 books and 1,189 chapters of the canon', () => {
		expect(BOOKS_CHIRHO).toHaveLength(66);
		const chaptersChirho = BOOKS_CHIRHO.reduce(
			(sumChirho, bookChirho) => sumChirho + bookChirho.chapters_chirho,
			0
		);
		expect(chaptersChirho).toBe(1189);
	});

	it('numbers the books 1 to 66 in order, each with its own three-character code', () => {
		expect(BOOKS_CHIRHO.map((bookChirho) => bookChirho.order_chirho)).toEqual(
			Array.from({ length: 66 }, (_unusedChirho, indexChirho) => indexChirho + 1)
		);
		const idsChirho = BOOKS_CHIRHO.map((bookChirho) => bookChirho.id_chirho);
		expect(new Set(idsChirho).size).toBe(66);
		expect(idsChirho.every((idChirho) => /^[1-3A-Z][A-Z]{2}$/.test(idChirho))).toBe(true);
	});

	it('starts with Genesis, ends with Revelation, and puts Matthew at 40', () => {
		expect(BOOKS_CHIRHO[0].id_chirho).toBe('GEN');
		expect(BOOKS_CHIRHO[39].id_chirho).toBe('MAT');
		expect(BOOKS_CHIRHO[65].id_chirho).toBe('REV');
	});

	it('finds a book by its code and refuses everything else', () => {
		expect(findBookChirho('JHN')?.chapters_chirho).toBe(21);
		expect(findBookChirho('PSA')?.chapters_chirho).toBe(150);
		for (const strangerChirho of ['jhn', 'John', '', 'XXX', '__proto__', 43, null, undefined, {}]) {
			expect(findBookChirho(strangerChirho)).toBeUndefined();
			expect(isBookIdChirho(strangerChirho)).toBe(false);
		}
		expect(isBookIdChirho('REV')).toBe(true);
	});
});
