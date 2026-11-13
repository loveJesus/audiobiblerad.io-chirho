// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Chapters split across several files: the rules a station's composite chapters must keep.
// The run-time reader and the build use this one function, so a composite chapter is held to
// the same rules wherever it comes from. Part of
// spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO, findBookChirho } from '../books-chirho/books_chirho';
import type { CompositeChapterChirho, StationChirho } from '../contract_chirho';
import { locateChapterChirho } from './locate_chirho';

export const COMPOSITE_PARTS_MIN_CHIRHO = 2;
export const COMPOSITE_PARTS_MAX_CHIRHO = 4;
export const COMPOSITE_PART_SECONDS_MIN_CHIRHO = 1;
export const COMPOSITE_PART_SECONDS_MAX_CHIRHO = 3600;
export const COMPOSITE_TOTAL_SECONDS_MAX_CHIRHO = 7200;

export type CompositeChaptersChirho = NonNullable<StationChirho['composite_chapters_chirho']>;

const DAY_PATTERN_CHIRHO = /^\d{4}-\d{2}-\d{2}$/;
const CHAPTER_TEXT_PATTERN_CHIRHO = /^[1-9]\d*$/;

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

/**
 * The folder a pattern station's files sit in: its template up to the last slash. Nothing when
 * the station is not a pattern station, or when that folder itself depends on the chapter, so
 * no part can be tied to the recording.
 */
export function recordingFolderChirho(stationChirho: StationChirho): string | null {
	const locatorChirho = stationChirho.locator_chirho;
	if (locatorChirho.kind_chirho !== 'pattern') return null;
	const templateChirho = locatorChirho.template_chirho;
	const folderChirho = templateChirho.slice(0, templateChirho.lastIndexOf('/') + 1);
	if (folderChirho === '' || folderChirho.includes('{')) return null;
	if (!URL.canParse(folderChirho)) return null;
	const urlChirho = new URL(folderChirho);
	if (urlChirho.protocol !== 'https:' || urlChirho.href !== folderChirho) return null;
	if (urlChirho.search !== '' || urlChirho.hash !== '') return null;
	return folderChirho;
}

/** A canonical secure address of a file directly inside `folderChirho`, with nothing after it. */
function isFileInFolderChirho(valueChirho: unknown, folderChirho: string): valueChirho is string {
	if (typeof valueChirho !== 'string' || !URL.canParse(valueChirho)) return false;
	const urlChirho = new URL(valueChirho);
	if (urlChirho.href !== valueChirho || urlChirho.search !== '' || urlChirho.hash !== '') {
		return false;
	}
	if (!valueChirho.startsWith(folderChirho)) return false;
	const nameChirho = valueChirho.slice(folderChirho.length);
	return nameChirho !== '' && !nameChirho.includes('/');
}

function isPartSecondsChirho(valueChirho: unknown): valueChirho is number {
	return (
		typeof valueChirho === 'number' &&
		Number.isFinite(valueChirho) &&
		valueChirho >= COMPOSITE_PART_SECONDS_MIN_CHIRHO &&
		valueChirho <= COMPOSITE_PART_SECONDS_MAX_CHIRHO
	);
}

/**
 * Read a station's composite chapters, or nothing when any of them breaks a rule:
 * - the book is one of the 66, written as its code, and the chapter is one of that book's;
 * - the chapter is not in the station's coverage and not among its locator's overrides;
 * - it has two to four parts, each a measured length of 1 to 3600 seconds, 7200 in all, and a
 *   measuring day;
 * - each part is a file directly inside the station's own recording folder, in canonical form,
 *   used once in the whole station and never the file of a chapter the coverage holds.
 * One broken entry rejects them all; the caller rejects the station with them.
 *
 * `stationChirho` is the station without its composite chapters, already read and checked.
 */
export function readCompositeChaptersChirho(
	valueChirho: unknown,
	stationChirho: StationChirho
): CompositeChaptersChirho | null {
	if (!isRecordChirho(valueChirho)) return null;
	const folderChirho = recordingFolderChirho(stationChirho);
	if (folderChirho === null) return null;
	const locatorChirho = stationChirho.locator_chirho;
	const overridesChirho =
		locatorChirho.kind_chirho === 'pattern' ? locatorChirho.overrides_chirho : undefined;

	// Every file a covered chapter plays: no part may be one of them.
	const usedChirho = new Set<string>();
	for (const bookChirho of BOOKS_CHIRHO) {
		for (const [firstChirho, lastChirho] of stationChirho.coverage_chirho[bookChirho.id_chirho] ??
			[]) {
			for (let chapterChirho = firstChirho; chapterChirho <= lastChirho; chapterChirho += 1) {
				const addressChirho = locateChapterChirho(locatorChirho, bookChirho, chapterChirho);
				if (addressChirho !== null) usedChirho.add(addressChirho);
			}
		}
	}

	const readChirho: Record<string, Record<string, CompositeChapterChirho>> = {};
	for (const [bookIdChirho, chaptersChirho] of Object.entries(valueChirho)) {
		const bookChirho = findBookChirho(bookIdChirho);
		if (!bookChirho || bookChirho.id_chirho !== bookIdChirho || !isRecordChirho(chaptersChirho)) {
			return null;
		}
		const coveredChirho = stationChirho.coverage_chirho[bookChirho.id_chirho] ?? [];
		const bookReadChirho: Record<string, CompositeChapterChirho> = {};
		for (const [chapterTextChirho, entryChirho] of Object.entries(chaptersChirho)) {
			const chapterChirho = Number(chapterTextChirho);
			if (
				!CHAPTER_TEXT_PATTERN_CHIRHO.test(chapterTextChirho) ||
				chapterChirho > bookChirho.chapters_chirho ||
				coveredChirho.some(
					([firstChirho, lastChirho]) => chapterChirho >= firstChirho && chapterChirho <= lastChirho
				) ||
				overridesChirho?.[bookChirho.id_chirho]?.[chapterTextChirho] !== undefined ||
				!isRecordChirho(entryChirho)
			) {
				return null;
			}
			const { parts_chirho: partsChirho, measured_on_chirho: measuredOnChirho } = entryChirho;
			if (typeof measuredOnChirho !== 'string' || !DAY_PATTERN_CHIRHO.test(measuredOnChirho)) {
				return null;
			}
			if (
				!Array.isArray(partsChirho) ||
				partsChirho.length < COMPOSITE_PARTS_MIN_CHIRHO ||
				partsChirho.length > COMPOSITE_PARTS_MAX_CHIRHO
			) {
				return null;
			}
			const readPartsChirho: CompositeChapterChirho['parts_chirho'][number][] = [];
			let totalChirho = 0;
			for (const partChirho of partsChirho as unknown[]) {
				if (!isRecordChirho(partChirho)) return null;
				const { url_chirho: urlChirho, duration_seconds_chirho: secondsChirho } = partChirho;
				if (!isFileInFolderChirho(urlChirho, folderChirho) || usedChirho.has(urlChirho)) {
					return null;
				}
				if (!isPartSecondsChirho(secondsChirho)) return null;
				usedChirho.add(urlChirho);
				totalChirho += secondsChirho;
				readPartsChirho.push({ url_chirho: urlChirho, duration_seconds_chirho: secondsChirho });
			}
			if (totalChirho > COMPOSITE_TOTAL_SECONDS_MAX_CHIRHO) return null;
			bookReadChirho[chapterTextChirho] = {
				parts_chirho: readPartsChirho,
				measured_on_chirho: measuredOnChirho
			};
		}
		readChirho[bookChirho.id_chirho] = bookReadChirho;
	}
	return readChirho;
}
