// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import type { BookIdChirho } from '../../books-chirho/books_chirho';
import type { LibrivoxProjectChirho } from './librivox_projects_chirho';
import { numberInTitleChirho, readLibrivoxSectionsChirho } from './librivox_sections_chirho';

function projectChirho(
	bookIdsChirho: BookIdChirho[],
	firstChaptersChirho?: number
): LibrivoxProjectChirho {
	return {
		station_id_chirho: 'fixture-station',
		librivox_id_chirho: 1,
		book_ids_chirho: bookIdsChirho,
		...(firstChaptersChirho === undefined ? {} : { first_chapters_chirho: firstChaptersChirho })
	};
}

/** Sections as LibriVox's catalogue gives them: numbers as text, and an address at www. */
function sectionsChirho(titlesChirho: string[]): Record<string, unknown>[] {
	return titlesChirho.map((titleChirho, indexChirho) => ({
		section_number: String(indexChirho + 1),
		title: titleChirho,
		listen_url: `https://www.archive.org/download/fixture/part_${indexChirho + 1}.mp3`
	}));
}

describe('reading the chapter number in a section title', () => {
	it('reads the last number, in digits or in Chinese numerals', () => {
		expect(numberInTitleChirho('Capítulo 03')).toBe(3);
		expect(numberInTitleChirho('1 Tesalonicenses 5')).toBe(5);
		expect(numberInTitleChirho('Chapter 02 - 第二章')).toBe(2);
		expect(numberInTitleChirho('第一章')).toBe(1);
		expect(numberInTitleChirho('第十章')).toBe(10);
		expect(numberInTitleChirho('第十一章')).toBe(11);
		expect(numberInTitleChirho('第二十章')).toBe(20);
		expect(numberInTitleChirho('第二十一章')).toBe(21);
		expect(numberInTitleChirho('第一百五十篇')).toBe(150);
	});

	it('finds no number where none is written', () => {
		expect(numberInTitleChirho('Filemón')).toBeNull();
		expect(numberInTitleChirho('')).toBeNull();
		expect(numberInTitleChirho(undefined)).toBeNull();
		expect(numberInTitleChirho(7)).toBeNull();
	});
});

describe('reading a recording as chapters', () => {
	it('takes a book with one titled section per chapter, and drops the extra hop from each address', () => {
		expect(
			readLibrivoxSectionsChirho(
				projectChirho(['RUT']),
				sectionsChirho(['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4'])
			)
		).toEqual({
			RUT: [1, 2, 3, 4].map(
				(numberChirho) => `https://archive.org/download/fixture/part_${numberChirho}.mp3`
			)
		});
	});

	it('takes several books read one after another, each numbered from its own chapter 1', () => {
		const readChirho = readLibrivoxSectionsChirho(
			projectChirho(['1JN', '2JN', '3JN']),
			sectionsChirho([
				'1 Juan 1',
				'1 Juan 2',
				'1 Juan 3',
				'1 Juan 4',
				'1 Juan 5',
				'2 Juan',
				'3 Juan'
			])
		);
		expect(readChirho).toEqual({
			'1JN': [1, 2, 3, 4, 5].map(
				(nChirho) => `https://archive.org/download/fixture/part_${nChirho}.mp3`
			),
			'2JN': ['https://archive.org/download/fixture/part_6.mp3'],
			'3JN': ['https://archive.org/download/fixture/part_7.mp3']
		});
	});

	it('takes the only section of a one-chapter book whatever its title says', () => {
		expect(
			readLibrivoxSectionsChirho(
				projectChirho(['JUD']),
				sectionsChirho(['Carta del Apóstol Judas'])
			)
		).toEqual({ JUD: ['https://archive.org/download/fixture/part_1.mp3'] });
	});

	it('takes the first chapters of a book from a recording that stops early', () => {
		const readChirho = readLibrivoxSectionsChirho(
			projectChirho(['MAT'], 2),
			sectionsChirho(['Upoko 01', 'Upoko 02'])
		);
		expect(readChirho).toEqual({
			MAT: [
				'https://archive.org/download/fixture/part_1.mp3',
				'https://archive.org/download/fixture/part_2.mp3'
			]
		});
	});

	it('refuses a recording whose sections are not its chapters', () => {
		// Two chapters to a section: playing section 2 as chapter 2 would read chapters 3 and 4.
		expect(
			readLibrivoxSectionsChirho(
				projectChirho(['RUT']),
				sectionsChirho(['Caps. 1 y 2', 'Caps. 3 y 4'])
			)
		).toBe('2 sections for 4 chapters');
		// The right count, but the titles show the sections are out of step.
		expect(
			readLibrivoxSectionsChirho(
				projectChirho(['RUT']),
				sectionsChirho(['Introducción', 'Capítulo 1', 'Capítulo 2', 'Capítulo 3'])
			)
		).toBe('section 1 is titled "Introducción", not chapter 1 of RUT');
		expect(
			readLibrivoxSectionsChirho(
				projectChirho(['1TH', '2TH']),
				sectionsChirho([
					...[1, 2, 3, 4, 5].map((n) => `Capítulo ${n}`),
					...[6, 7, 8].map((n) => `Capítulo ${n}`)
				])
			)
		).toBe('section 6 is titled "Capítulo 6", not chapter 1 of 2TH');
	});

	it('refuses a recording with a section missing, misnumbered or without a secure address', () => {
		const fourChirho = sectionsChirho(['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4']);
		expect(
			readLibrivoxSectionsChirho(projectChirho(['RUT']), [
				...fourChirho.slice(0, 2),
				{ ...fourChirho[2], section_number: '4' },
				fourChirho[3]
			])
		).toBe('section 3 is numbered 4');
		expect(
			readLibrivoxSectionsChirho(projectChirho(['RUT']), [
				...fourChirho.slice(0, 3),
				{ ...fourChirho[3], listen_url: null }
			])
		).toBe('section 4 has no secure address');
		expect(
			readLibrivoxSectionsChirho(projectChirho(['RUT']), [
				{ ...fourChirho[0], listen_url: 'http://www.archive.org/download/fixture/part_1.mp3' },
				...fourChirho.slice(1)
			])
		).toBe('section 1 has no secure address');
		expect(
			readLibrivoxSectionsChirho(projectChirho(['RUT']), [
				...fourChirho.slice(0, 3),
				'section four'
			])
		).toBe('section 4 cannot be read');
	});

	it('refuses a project that does not make sense', () => {
		expect(readLibrivoxSectionsChirho(projectChirho([]), [])).toBe('the project names no book');
		expect(readLibrivoxSectionsChirho(projectChirho(['XXX' as BookIdChirho]), [])).toBe(
			'"XXX" is not one of the 66 books'
		);
		for (const [booksChirho, firstChirho] of [
			[['RUT'], 5],
			[['RUT'], 0],
			[['RUT'], 1.5],
			[['RUT', 'JUD'], 2]
		] as [BookIdChirho[], number][]) {
			expect(readLibrivoxSectionsChirho(projectChirho(booksChirho, firstChirho), [])).toBe(
				'a recording that stops early must name one book and a number of chapters within it'
			);
		}
	});
});
