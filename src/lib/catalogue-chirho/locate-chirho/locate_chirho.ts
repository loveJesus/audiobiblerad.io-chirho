// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Finding a chapter: which chapters a station has, and the address of each.
// Nothing here touches the network, so a player can resolve an address and start playing
// inside the same tap. Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO, findBookChirho, type BookChirho } from '../books-chirho/books_chirho';
import { BOOK_CODE_SCHEMES_CHIRHO } from '../books-chirho/book_code_schemes_chirho';
import type {
	ChapterAudioChirho,
	ChapterPlaybackChirho,
	ChapterRefChirho,
	CoverageChirho,
	LocatorChirho,
	StationChirho
} from '../contract_chirho';

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
		['chapter_pad3_chirho', chapterTextChirho.padStart(3, '0')],
		[
			'chapter_pad_book_chirho',
			chapterTextChirho.padStart(Math.max(2, String(bookChirho.chapters_chirho).length), '0')
		]
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

function bookCodesOfChirho(locatorChirho: LocatorChirho): string | undefined {
	return locatorChirho.kind_chirho === 'pattern' ? locatorChirho.book_codes_chirho : undefined;
}

/**
 * The address a locator gives for a chapter, whether or not the chapter was verified to exist.
 * The availability check asks the host about exactly this address; players use
 * `resolveChapterChirho`, which answers only for verified chapters.
 */
export function locateChapterChirho(
	locatorChirho: LocatorChirho,
	bookChirho: BookChirho,
	chapterChirho: number
): string | null {
	if (!isChapterNumberChirho(chapterChirho)) return null;
	if (locatorChirho.kind_chirho === 'pattern') {
		const overrideChirho =
			locatorChirho.overrides_chirho?.[bookChirho.id_chirho]?.[String(chapterChirho)];
		if (typeof overrideChirho === 'string') return overrideChirho;
		return expandTemplateChirho(
			locatorChirho.template_chirho,
			bookChirho,
			chapterChirho,
			locatorChirho.book_codes_chirho
		);
	}
	if (locatorChirho.kind_chirho === 'index') {
		return locatorChirho.files_chirho[bookChirho.id_chirho]?.[chapterChirho - 1] ?? null;
	}
	// A kind added after this code was written is skipped, never guessed at.
	return null;
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
	return walkCanonChirho(bookIdChirho, chapterChirho, (bookChirho, fromChirho) =>
		firstCoveredChapterChirho(stationChirho.coverage_chirho, bookChirho, fromChirho)
	);
}

/**
 * One full turn of the canon: from the starting book to the end, then from Genesis round to
 * the starting book again, this time from its first chapter. `firstChirho` names the lowest
 * chapter a book has at or after a number.
 */
function walkCanonChirho(
	bookIdChirho: string,
	chapterChirho: number,
	firstChirho: (bookChirho: BookChirho, fromChirho: number) => number | null
): ChapterRefChirho | null {
	const startBookChirho = findBookChirho(bookIdChirho);
	if (!startBookChirho || !isChapterNumberChirho(chapterChirho)) return null;

	const startIndexChirho = startBookChirho.order_chirho - 1;
	for (let stepChirho = 0; stepChirho <= BOOKS_CHIRHO.length; stepChirho += 1) {
		const bookChirho = BOOKS_CHIRHO[(startIndexChirho + stepChirho) % BOOKS_CHIRHO.length];
		const foundChirho = firstChirho(bookChirho, stepChirho === 0 ? chapterChirho : 1);
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

	const urlChirho = locateChapterChirho(stationChirho.locator_chirho, bookChirho, chapterChirho);
	if (urlChirho === null) return null;

	const timingsChirho = stationChirho.timings_chirho;
	const timingsUrlChirho = timingsChirho
		? expandTemplateChirho(
				timingsChirho.template_chirho,
				bookChirho,
				chapterChirho,
				bookCodesOfChirho(stationChirho.locator_chirho)
			)
		: null;

	return timingsUrlChirho === null
		? { url_chirho: urlChirho }
		: { url_chirho: urlChirho, timings_url_chirho: timingsUrlChirho };
}

// What a station offers: the chapters it plays from one file, which every helper above knows,
// and the chapters it plays from several, which only these helpers know. A player that plays
// split chapters uses these; one that does not keeps to those above and never meets one.

/** The lowest chapter of a book the station offers, either way, at or after `fromChirho`. */
function firstOfferedChapterChirho(
	stationChirho: StationChirho,
	bookChirho: BookChirho,
	fromChirho: number
): number | null {
	let foundChirho = firstCoveredChapterChirho(
		stationChirho.coverage_chirho,
		bookChirho,
		fromChirho
	);
	for (const chapterTextChirho of Object.keys(
		stationChirho.composite_chapters_chirho?.[bookChirho.id_chirho] ?? {}
	)) {
		const chapterChirho = Number(chapterTextChirho);
		if (chapterChirho >= fromChirho && (foundChirho === null || chapterChirho < foundChirho)) {
			foundChirho = chapterChirho;
		}
	}
	return foundChirho;
}

function compositeChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
) {
	const bookChirho = findBookChirho(bookIdChirho);
	if (!bookChirho || !isChapterNumberChirho(chapterChirho)) return undefined;
	const chaptersChirho = stationChirho.composite_chapters_chirho?.[bookChirho.id_chirho];
	return chaptersChirho !== undefined && Object.hasOwn(chaptersChirho, String(chapterChirho))
		? chaptersChirho[String(chapterChirho)]
		: undefined;
}

/** True when the station offers this chapter, from one file or from several. */
export function offersChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): boolean {
	return (
		stationHasChapterChirho(stationChirho, bookIdChirho, chapterChirho) ||
		compositeChapterChirho(stationChirho, bookIdChirho, chapterChirho) !== undefined
	);
}

/** As `chapterAtOrAfterChirho`, over every chapter the station offers. */
export function offeredChapterAtOrAfterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterRefChirho | null {
	return walkCanonChirho(bookIdChirho, chapterChirho, (bookChirho, fromChirho) =>
		firstOfferedChapterChirho(stationChirho, bookChirho, fromChirho)
	);
}

/** As `nextChapterChirho`, over every chapter the station offers. */
export function nextOfferedChapterChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterRefChirho | null {
	if (!isChapterNumberChirho(chapterChirho)) return null;
	return offeredChapterAtOrAfterChirho(stationChirho, bookIdChirho, chapterChirho + 1);
}

/** How many chapters the station offers: its coverage and its split chapters. */
export function offeredChapterCountChirho(stationChirho: StationChirho): number {
	let countChirho = stationChirho.chapter_count_chirho;
	for (const chaptersChirho of Object.values(stationChirho.composite_chapters_chirho ?? {})) {
		countChirho += Object.keys(chaptersChirho ?? {}).length;
	}
	return countChirho;
}

/**
 * How to play a chapter the station offers: one file, with its timings where it has them and
 * no length yet, or several files in order with their measured lengths. Nothing for a chapter
 * it does not offer.
 */
export function resolveChapterPlaybackChirho(
	stationChirho: StationChirho,
	bookIdChirho: string,
	chapterChirho: number
): ChapterPlaybackChirho | null {
	const audioChirho = resolveChapterChirho(stationChirho, bookIdChirho, chapterChirho);
	if (audioChirho !== null) {
		return { kind_chirho: 'single', ...audioChirho, total_seconds_chirho: null };
	}
	const compositeChirho = compositeChapterChirho(stationChirho, bookIdChirho, chapterChirho);
	if (compositeChirho === undefined) return null;
	return {
		kind_chirho: 'composite',
		parts_chirho: compositeChirho.parts_chirho,
		total_seconds_chirho: compositeChirho.parts_chirho.reduce(
			(sumChirho, partChirho) => sumChirho + partChirho.duration_seconds_chirho,
			0
		)
	};
}
