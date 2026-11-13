// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Finding a chapter: which chapters a station has, and the address of each.
// Nothing here touches the network, so a player can resolve an address and start playing
// inside the same tap. Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO, findBookChirho, type BookChirho } from './books_chirho';
import { BOOK_CODE_SCHEMES_CHIRHO } from './book_code_schemes_chirho';
import type {
	ChapterAudioChirho,
	ChapterRefChirho,
	CoverageChirho,
	StationChirho
} from './contract_chirho';

const PLACEHOLDER_PATTERN_CHIRHO = /\{([a-z0-9_]+)\}/g;

function isChapterNumberChirho(valueChirho: unknown): valueChirho is number {
	return typeof valueChirho === 'number' && Number.isInteger(valueChirho) && valueChirho >= 1;
}

/**
 * Fill a locator or timings template for one chapter. Returns nothing when the template asks
 * for something that is not known, so a bad template can never produce a half-built address.
 */
export function expandTemplateChirho(
	templateChirho: string,
	bookChirho: BookChirho,
	chapterChirho: number,
	bookCodesChirho?: string
): string | null {
	const chapterTextChirho = String(chapterChirho);
	const valuesChirho = new Map<string, string | undefined>([
		['book_upper_chirho', bookChirho.id_chirho],
		['book_lower_chirho', bookChirho.id_chirho.toLowerCase()],
		[
			'book_code_chirho',
			bookCodesChirho === undefined
				? undefined
				: BOOK_CODE_SCHEMES_CHIRHO[bookCodesChirho]?.[bookChirho.order_chirho - 1]
		],
		['book_order_pad2_chirho', String(bookChirho.order_chirho).padStart(2, '0')],
		['chapter_chirho', chapterTextChirho],
		['chapter_pad2_chirho', chapterTextChirho.padStart(2, '0')],
		['chapter_pad3_chirho', chapterTextChirho.padStart(3, '0')]
	]);

	let completeChirho = true;
	const addressChirho = templateChirho.replace(
		PLACEHOLDER_PATTERN_CHIRHO,
		(_matchChirho, nameChirho: string) => {
			const valueChirho = valuesChirho.get(nameChirho);
			if (valueChirho === undefined) {
				completeChirho = false;
				return '';
			}
			return valueChirho;
		}
	);
	return completeChirho ? addressChirho : null;
}

/** The lowest chapter of a book that the coverage holds, at or after `fromChapterChirho`. */
function firstCoveredChapterChirho(
	coverageChirho: CoverageChirho,
	bookChirho: BookChirho,
	fromChapterChirho: number
): number | null {
	let foundChirho: number | null = null;
	for (const [firstChirho, lastChirho] of coverageChirho[bookChirho.id_chirho] ?? []) {
		if (lastChirho < fromChapterChirho) continue;
		const candidateChirho = Math.max(firstChirho, fromChapterChirho);
		if (foundChirho === null || candidateChirho < foundChirho) foundChirho = candidateChirho;
	}
	return foundChirho;
}

/** True when the station was verified to have this chapter. Safe with untrusted values. */
export function stationHasChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): boolean {
	const bookChirho = findBookChirho(bookIdChirho);
	if (!bookChirho || !isChapterNumberChirho(chapterChirho)) return false;
	return (
		firstCoveredChapterChirho(stationChirho.coverage_chirho, bookChirho, chapterChirho) ===
		chapterChirho
	);
}

/**
 * The same chapter when the station has it, otherwise the next chapter it does have, in canon
 * order, wrapping from the end of the Bible back to the station's first chapter.
 *
 * This is the dial landing on a station that lacks the chapter being played.
 * Returns nothing when the station has no chapters, or when the book or chapter is not a real
 * place (an unknown book, or a chapter that is not a whole number from 1 up).
 */
export function chapterAtOrAfterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterRefChirho | null {
	const startBookChirho = findBookChirho(bookIdChirho);
	if (!startBookChirho || !isChapterNumberChirho(chapterChirho)) return null;

	const startIndexChirho = startBookChirho.order_chirho - 1;
	// One full turn of the canon: from the starting book to the end, then from Genesis round to
	// the starting book again, this time from its first chapter.
	for (let stepChirho = 0; stepChirho <= BOOKS_CHIRHO.length; stepChirho += 1) {
		const bookChirho = BOOKS_CHIRHO[(startIndexChirho + stepChirho) % BOOKS_CHIRHO.length];
		const foundChirho = firstCoveredChapterChirho(
			stationChirho.coverage_chirho,
			bookChirho,
			stepChirho === 0 ? chapterChirho : 1
		);
		if (foundChirho !== null) {
			return { book_id_chirho: bookChirho.id_chirho, chapter_chirho: foundChirho };
		}
	}
	return null;
}

/**
 * The chapter that follows this one on the station, skipping chapters it lacks and wrapping
 * from the end of the Bible back to the station's first chapter. A station with a single
 * chapter returns that chapter again. Returns nothing under the same conditions as
 * `chapterAtOrAfterChirho`.
 */
export function nextChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterRefChirho | null {
	if (!isChapterNumberChirho(chapterChirho)) return null;
	return chapterAtOrAfterChirho(stationChirho, bookIdChirho, chapterChirho + 1);
}

/**
 * The address of a chapter's audio, and of its verse timings where the station has them.
 * Returns nothing for any chapter the station was not verified to have.
 */
export function resolveChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterAudioChirho | null {
	if (!stationHasChapterChirho(stationChirho, bookIdChirho, chapterChirho)) return null;
	const bookChirho = findBookChirho(bookIdChirho);
	if (!bookChirho) return null;

	const locatorChirho = stationChirho.locator_chirho;
	// A locator kind this code does not know is skipped, never guessed at.
	if (locatorChirho.kind_chirho !== 'pattern') return null;

	const urlChirho = expandTemplateChirho(
		locatorChirho.template_chirho,
		bookChirho,
		chapterChirho,
		locatorChirho.book_codes_chirho
	);
	if (urlChirho === null) return null;

	const timingsChirho = stationChirho.timings_chirho;
	const timingsUrlChirho = timingsChirho
		? expandTemplateChirho(
				timingsChirho.template_chirho,
				bookChirho,
				chapterChirho,
				locatorChirho.book_codes_chirho
			)
		: null;

	return timingsUrlChirho === null
		? { url_chirho: urlChirho }
		: { url_chirho: urlChirho, timings_url_chirho: timingsUrlChirho };
}
