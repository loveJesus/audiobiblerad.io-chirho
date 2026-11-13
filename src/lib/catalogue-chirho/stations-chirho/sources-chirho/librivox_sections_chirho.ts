// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Reading one LibriVox recording's sections as chapters. A recording is taken only when its
// sections are the chapters of its book or books, one for one, in order. Anything else is
// refused with a reason, because a section that holds two chapters would play the wrong
// Scripture under a chapter's name.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { findBookChirho, type BookIdChirho } from '../../books-chirho/books_chirho';
import type { LibrivoxProjectChirho } from './librivox_projects_chirho';

/** The addresses of a recording's chapters, by book, chapter 1 first. */
export type LibrivoxChaptersChirho = Partial<Record<BookIdChirho, string[]>>;

const HAN_DIGITS_CHIRHO = '〇一二三四五六七八九';

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

/** A number written in Chinese numerals, up to the hundreds: 21 for 二十一. */
function hanNumberChirho(textChirho: string): number | null {
	let totalChirho = 0;
	let currentChirho = 0;
	for (const characterChirho of textChirho) {
		if (characterChirho === '十' || characterChirho === '百') {
			totalChirho += (currentChirho || 1) * (characterChirho === '十' ? 10 : 100);
			currentChirho = 0;
		} else {
			const valueChirho = HAN_DIGITS_CHIRHO.indexOf(
				characterChirho === '零' ? '〇' : characterChirho
			);
			if (valueChirho === -1) return null;
			currentChirho = valueChirho;
		}
	}
	return totalChirho + currentChirho;
}

/**
 * The last whole number written in a section's title: 3 for "Capítulo 03", 21 for "第二十一章".
 * Digits are preferred; Chinese numerals are read only when the title has no digits.
 */
export function numberInTitleChirho(titleChirho: unknown): number | null {
	if (typeof titleChirho !== 'string') return null;
	const digitsChirho = titleChirho.match(/\d+/g);
	if (digitsChirho) return Number(digitsChirho.at(-1));
	const hanChirho = titleChirho.match(/[〇零一二三四五六七八九十百]+/g);
	return hanChirho ? hanNumberChirho(hanChirho.at(-1)!) : null;
}

/** LibriVox's catalogue lists addresses at `www.archive.org`, which only redirects to `archive.org`. */
function withoutExtraHopChirho(addressChirho: string): string {
	return addressChirho.replace(/^https:\/\/www\.archive\.org\//, 'https://archive.org/');
}

function readAddressChirho(valueChirho: unknown): string | null {
	if (typeof valueChirho !== 'string' || !URL.canParse(valueChirho)) return null;
	return new URL(valueChirho).protocol === 'https:' ? withoutExtraHopChirho(valueChirho) : null;
}

/**
 * Read a recording's sections as the chapters its project says it holds.
 *
 * Returns the chapter addresses by book, or a sentence saying why the recording cannot be
 * used. It is used only when:
 * - it has exactly as many sections as its books have chapters (or, for a recording that stops
 *   early, as many as the project says);
 * - the sections are numbered from 1 with none missing;
 * - each section's title carries its chapter number within its book. The only section of a
 *   one-chapter book needs no number, since nobody writes "Jude 1";
 * - every section has a secure address.
 */
export function readLibrivoxSectionsChirho(
	projectChirho: LibrivoxProjectChirho,
	sectionsChirho: readonly unknown[]
): LibrivoxChaptersChirho | string {
	const partsChirho: { book_id_chirho: BookIdChirho; chapters_chirho: number }[] = [];
	for (const bookIdChirho of projectChirho.book_ids_chirho) {
		const bookChirho = findBookChirho(bookIdChirho);
		if (!bookChirho) return `"${bookIdChirho}" is not one of the 66 books`;
		partsChirho.push({
			book_id_chirho: bookChirho.id_chirho,
			chapters_chirho: bookChirho.chapters_chirho
		});
	}
	const firstChaptersChirho = projectChirho.first_chapters_chirho;
	if (firstChaptersChirho !== undefined) {
		const [onlyChirho] = partsChirho;
		if (
			partsChirho.length !== 1 ||
			!Number.isInteger(firstChaptersChirho) ||
			firstChaptersChirho < 1 ||
			firstChaptersChirho > onlyChirho.chapters_chirho
		) {
			return 'a recording that stops early must name one book and a number of chapters within it';
		}
		onlyChirho.chapters_chirho = firstChaptersChirho;
	}

	const expectedChirho = partsChirho.reduce(
		(sumChirho, partChirho) => sumChirho + partChirho.chapters_chirho,
		0
	);
	if (expectedChirho === 0) return 'the project names no book';
	if (sectionsChirho.length !== expectedChirho) {
		return `${sectionsChirho.length} sections for ${expectedChirho} chapters`;
	}

	const chaptersChirho: LibrivoxChaptersChirho = {};
	let positionChirho = 0;
	for (const partChirho of partsChirho) {
		const addressesChirho: string[] = [];
		for (let chapterChirho = 1; chapterChirho <= partChirho.chapters_chirho; chapterChirho += 1) {
			const sectionChirho = sectionsChirho[positionChirho];
			positionChirho += 1;
			if (!isRecordChirho(sectionChirho)) return `section ${positionChirho} cannot be read`;
			if (Number(sectionChirho.section_number) !== positionChirho) {
				return `section ${positionChirho} is numbered ${String(sectionChirho.section_number)}`;
			}
			const wholeBookIsOneChapterChirho =
				findBookChirho(partChirho.book_id_chirho)?.chapters_chirho === 1;
			if (
				!wholeBookIsOneChapterChirho &&
				numberInTitleChirho(sectionChirho.title) !== chapterChirho
			) {
				return `section ${positionChirho} is titled "${String(sectionChirho.title)}", not chapter ${chapterChirho} of ${partChirho.book_id_chirho}`;
			}
			const addressChirho = readAddressChirho(sectionChirho.listen_url);
			if (addressChirho === null) return `section ${positionChirho} has no secure address`;
			addressesChirho.push(addressChirho);
		}
		chaptersChirho[partChirho.book_id_chirho] = addressesChirho;
	}
	return chaptersChirho;
}
