// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations from Davar Audio Bibles (https://davaraudiobibles.org/audio-bible-library/), which
// serves a file per chapter from its own host. There are hundreds, so they are not bundled:
// `scripts-chirho/catalogue-chirho/build_davar_languages_chirho.ts` turns a reading of the
// library's index and of each recording's own file list into one small file per language.
// This is the part that decides what a recording has. A chapter is claimed only when the
// recording's own list names a file for it.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO, findBookChirho, type BookChirho } from '../../books-chirho/books_chirho';
import { BOOK_CODE_SCHEMES_CHIRHO } from '../../books-chirho/book_code_schemes_chirho';
import type { PatternLocatorChirho, StationChirho } from '../../contract_chirho';
import { expandTemplateChirho } from '../../locate-chirho/locate_chirho';
import { chaptersToRangesChirho, countChaptersChirho } from '../coverage_chirho';
import { DAVAR_HEBREW_JOEL_APPROVED_CHIRHO } from './davar_numbering_chirho';

export const DAVAR_SOURCE_ID_CHIRHO = 'davar';
export const DAVAR_SOURCE_NAME_CHIRHO = 'Davar Audio Bibles';
/** Where its terms are stated, and the terms as read there on 2026-11-13. */
export const DAVAR_TERMS_ADDRESS_CHIRHO = 'https://davaraudiobibles.org/audio-bible-library/';
export const DAVAR_TERMS_CHIRHO =
	'This audio is free to download and distribute, but it may not be sold or used for any commercial purpose. When sharing, you must include the copyright notice visibly on any physical label or digital display. All other rights are reserved by the copyright holder.';
const DAVAR_AUDIO_HOST_CHIRHO = 'https://audio.dbs.org/';
const DAVAR_BOOK_CODES_CHIRHO = 'davar_chirho';

/** The two chapter widths its recordings use: two digits with three in Psalms, or three throughout. */
const CHAPTER_WIDTHS_CHIRHO = ['{chapter_pad_book_chirho}', '{chapter_pad3_chirho}'] as const;

/** Other spellings of a book name seen in its file lists, without spaces and in lower case. */
const OTHER_BOOK_NAMES_CHIRHO: Readonly<Record<string, number>> = {
	songofsolomon: 22,
	songofsongs: 22
};

/** Other three-character codes seen in its file lists for a book of the 66. */
const OTHER_BOOK_CODES_CHIRHO: Readonly<Record<string, string>> = {
	ODA: 'OBA',
	OBD: 'OBA'
};

export interface DavarLanguageChirho {
	readonly code_chirho: string;
	readonly name_chirho: string;
	readonly english_chirho: string;
}

export interface DavarNotesChirho {
	readonly recording_chirho: string;
	readonly files_chirho: number;
	readonly chapters_chirho: number;
	/** Chapters whose file is named out of pattern and is reached through an override. */
	readonly overrides_chirho: number;
	/** Files that name no chapter of the 66 books: a split chapter, another book, a stray name. */
	readonly unmatched_chirho: readonly string[];
	/** Files for a chapter that another file already filled. */
	readonly duplicates_chirho: number;
	/** How the recording numbers Joel and Malachi, judged from its file list alone. */
	readonly numbering_chirho: DavarNumberingChirho;
	/** Files held back because they are part of a chapter and not the whole of it. */
	readonly withheld_chirho: readonly string[];
	/** Why no station was made, when none was. */
	readonly refused_chirho?: string;
}

/**
 * Hebrew Bibles, and translations that follow them, count Joel in four chapters and Malachi in
 * three: Joel 2:28-32 is their chapter 3, Joel 3 is their chapter 4, and Malachi 4 is the end
 * of their chapter 3.
 * - `hebrew_inferred`: the list names a Joel 4 and a Malachi 3 and no Malachi 4, and the
 *   recording is one approved by name in `davar_numbering_chirho.ts`. Inferred from the names.
 *   Nobody has listened, and the maker has not confirmed it.
 * - `unresolved`: the list names a Joel 4 but does not fit that pattern, or fits it and is not
 *   approved. Left as it is: its Joel 4 file is not played.
 */
export type DavarNumberingChirho = 'standard' | 'hebrew_inferred' | 'unresolved';

/**
 * Where a file of Joel belongs when the recording counts Joel in four. Its fourth file is
 * chapter 3, whole. Its second and third files are each a part of chapter 2, and are held
 * back: this catalogue cannot yet play a chapter from two files.
 */
const HEBREW_JOEL_CHIRHO: Readonly<Record<number, number | 'withheld'>> = {
	1: 1,
	2: 'withheld',
	3: 'withheld',
	4: 3
};

function textOfChirho(valueChirho: unknown): string {
	return typeof valueChirho === 'string' ? valueChirho.trim().replace(/\s+/g, ' ') : '';
}

/**
 * The book and chapter a file name stands for, or nothing.
 *
 * Two forms are read: the book's number, its English name and the chapter
 * (`40_Matthew_01.mp3`, with stray spaces or other widths forgiven), and the three-character
 * book code and the chapter (`1CH_001.mp3`, `2 JN_001.mp3`). A name that splits a chapter (`19_Psalms_009A.mp3`)
 * or names a book outside the 66 is not read: half a chapter must not play as a whole one.
 */
export function parseDavarFileNameChirho(
	nameChirho: unknown
): { book_chirho: BookChirho; chapter_chirho: number } | null {
	const readChirho = readDavarFileNameChirho(nameChirho);
	return readChirho && readChirho.chapter_chirho <= readChirho.book_chirho.chapters_chirho
		? readChirho
		: null;
}

/**
 * The book and the number a file name carries, as the recording numbers it. The number may be
 * past the book's last chapter in this catalogue: a recording may count a book's chapters
 * differently, and `buildDavarStationChirho` decides what such a file is.
 */
function readDavarFileNameChirho(
	nameChirho: unknown
): { book_chirho: BookChirho; chapter_chirho: number } | null {
	if (typeof nameChirho !== 'string') return null;
	// A stray space or a doubled dot before the ending is forgiven.
	const stemChirho = /^(.*?)[\s.]*\.mp3$/i.exec(nameChirho)?.[1]?.trim();
	if (stemChirho === undefined) return null;

	let bookChirho: BookChirho | undefined;
	let chapterTextChirho: string | undefined;
	const numberedChirho = /^(\d{2})_(.+)_(\d{1,4})$/.exec(stemChirho);
	const codedChirho = /^([1-3]? ?[A-Z]{2,3})_(\d{1,4})$/.exec(stemChirho);
	if (numberedChirho) {
		const orderChirho = Number(numberedChirho[1]);
		const writtenChirho = numberedChirho[2].replace(/\s+/g, '').toLowerCase();
		const expectedChirho = BOOK_CODE_SCHEMES_CHIRHO[DAVAR_BOOK_CODES_CHIRHO][orderChirho - 1];
		if (
			expectedChirho !== undefined &&
			(writtenChirho === expectedChirho.toLowerCase() ||
				OTHER_BOOK_NAMES_CHIRHO[writtenChirho] === orderChirho)
		) {
			bookChirho = BOOKS_CHIRHO[orderChirho - 1];
			chapterTextChirho = numberedChirho[3];
		}
	} else if (codedChirho) {
		const codeChirho = codedChirho[1].replace(' ', '');
		bookChirho = findBookChirho(OTHER_BOOK_CODES_CHIRHO[codeChirho] ?? codeChirho);
		chapterTextChirho = codedChirho[2];
	}
	if (!bookChirho || chapterTextChirho === undefined) return null;
	const chapterChirho = Number(chapterTextChirho);
	if (chapterChirho < 1) return null;
	return { book_chirho: bookChirho, chapter_chirho: chapterChirho };
}

function addressOfChirho(recordingChirho: string, fileNameChirho: string): string {
	return `${DAVAR_AUDIO_HOST_CHIRHO}${encodeURIComponent(recordingChirho)}/${encodeURIComponent(fileNameChirho)}`;
}

function stationIdChirho(recordingChirho: string): string {
	const slugChirho = recordingChirho
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `davar-${slugChirho}`;
}

/**
 * Make a station from one entry of the library's index and that recording's own file list.
 *
 * Returns the station, or none with the reason, and notes on what was read. The station's
 * addresses are a template plus an override for every chapter whose file is named otherwise,
 * so that each address is exactly a name the list holds.
 */
export function buildDavarStationChirho(
	entryChirho: unknown,
	fileNamesChirho: readonly unknown[],
	languageChirho: DavarLanguageChirho,
	readOnChirho: string,
	hebrewJoelApprovedChirho: ReadonlySet<string> = DAVAR_HEBREW_JOEL_APPROVED_CHIRHO
): { station_chirho: StationChirho | null; notes_chirho: DavarNotesChirho } {
	const recordChirho =
		typeof entryChirho === 'object' && entryChirho !== null
			? (entryChirho as Record<string, unknown>)
			: {};
	const recordingChirho = textOfChirho(recordChirho.id);
	const titleChirho = textOfChirho(recordChirho.tt);
	const creditChirho = [recordChirho.text_copyright, recordChirho.audio_copyright]
		.map(textOfChirho)
		.filter((partChirho) => partChirho !== '')
		.join(' · ');

	const readNamesChirho = fileNamesChirho.map((nameChirho) => readDavarFileNameChirho(nameChirho));
	const listsChirho = (bookIdChirho: string, numberChirho: number): boolean =>
		readNamesChirho.some(
			(readChirho) =>
				readChirho?.book_chirho.id_chirho === bookIdChirho &&
				readChirho.chapter_chirho === numberChirho
		);
	const numberingChirho: DavarNumberingChirho = !listsChirho('JOL', 4)
		? 'standard'
		: listsChirho('MAL', 3) &&
			  !listsChirho('MAL', 4) &&
			  hebrewJoelApprovedChirho.has(recordingChirho)
			? 'hebrew_inferred'
			: 'unresolved';

	// Which file fills each chapter. The first file named for a chapter keeps it.
	const filesChirho = new Map<string, Map<number, string>>();
	const unmatchedChirho: string[] = [];
	const withheldChirho: string[] = [];
	let duplicatesChirho = 0;
	fileNamesChirho.forEach((nameChirho, indexChirho) => {
		const readChirho = readNamesChirho[indexChirho];
		let chapterChirho: number | 'withheld' | undefined = readChirho?.chapter_chirho;
		if (readChirho?.book_chirho.id_chirho === 'JOL' && numberingChirho === 'hebrew_inferred') {
			chapterChirho = HEBREW_JOEL_CHIRHO[readChirho.chapter_chirho];
		}
		if (chapterChirho === 'withheld') {
			withheldChirho.push(String(nameChirho));
			return;
		}
		if (
			!readChirho ||
			chapterChirho === undefined ||
			chapterChirho > readChirho.book_chirho.chapters_chirho
		) {
			unmatchedChirho.push(String(nameChirho));
			return;
		}
		const bookIdChirho = readChirho.book_chirho.id_chirho;
		if (!filesChirho.has(bookIdChirho)) filesChirho.set(bookIdChirho, new Map());
		const chaptersChirho = filesChirho.get(bookIdChirho)!;
		if (chaptersChirho.has(chapterChirho)) duplicatesChirho += 1;
		else chaptersChirho.set(chapterChirho, nameChirho as string);
	});

	// The chapter width that names the most files as they are; the rest become overrides.
	const candidatesChirho = CHAPTER_WIDTHS_CHIRHO.map((widthChirho) => {
		const templateChirho = `${DAVAR_AUDIO_HOST_CHIRHO}${encodeURIComponent(recordingChirho)}/{book_order_pad2_chirho}_{book_code_chirho}_${widthChirho}.mp3`;
		const overridesChirho: Record<string, Record<string, string>> = {};
		let countChirho = 0;
		for (const bookChirho of BOOKS_CHIRHO) {
			for (const [chapterChirho, nameChirho] of filesChirho.get(bookChirho.id_chirho) ?? []) {
				const actualChirho = addressOfChirho(recordingChirho, nameChirho);
				const expectedChirho = expandTemplateChirho(
					templateChirho,
					bookChirho,
					chapterChirho,
					DAVAR_BOOK_CODES_CHIRHO
				);
				if (expectedChirho !== actualChirho) {
					(overridesChirho[bookChirho.id_chirho] ??= {})[String(chapterChirho)] = actualChirho;
					countChirho += 1;
				}
			}
		}
		return { templateChirho, overridesChirho, countChirho };
	});
	const chosenChirho = candidatesChirho.reduce((bestChirho, candidateChirho) =>
		candidateChirho.countChirho < bestChirho.countChirho ? candidateChirho : bestChirho
	);

	const coverageChirho: Record<string, (readonly [number, number])[]> = {};
	for (const bookChirho of BOOKS_CHIRHO) {
		const chaptersChirho = filesChirho.get(bookChirho.id_chirho);
		if (chaptersChirho && chaptersChirho.size > 0) {
			coverageChirho[bookChirho.id_chirho] = chaptersToRangesChirho([...chaptersChirho.keys()]);
		}
	}
	const chapterCountChirho = countChaptersChirho(coverageChirho);

	const refusedChirho =
		recordingChirho === ''
			? 'the index entry has no id'
			: titleChirho === ''
				? 'the index entry has no title'
				: creditChirho === ''
					? 'the index entry has no copyright notice to show'
					: chapterCountChirho === 0
						? 'its file list names no chapter of the 66 books'
						: undefined;
	const notesChirho: DavarNotesChirho = {
		recording_chirho: recordingChirho,
		files_chirho: fileNamesChirho.length,
		chapters_chirho: chapterCountChirho,
		overrides_chirho: chosenChirho.countChirho,
		unmatched_chirho: unmatchedChirho,
		duplicates_chirho: duplicatesChirho,
		numbering_chirho: numberingChirho,
		withheld_chirho: withheldChirho,
		...(refusedChirho === undefined ? {} : { refused_chirho: refusedChirho })
	};
	if (refusedChirho !== undefined) return { station_chirho: null, notes_chirho: notesChirho };

	const locatorChirho: PatternLocatorChirho = {
		kind_chirho: 'pattern',
		template_chirho: chosenChirho.templateChirho,
		book_codes_chirho: DAVAR_BOOK_CODES_CHIRHO,
		...(chosenChirho.countChirho > 0 ? { overrides_chirho: chosenChirho.overridesChirho } : {})
	};
	return {
		notes_chirho: notesChirho,
		station_chirho: {
			id_chirho: stationIdChirho(recordingChirho),
			source_id_chirho: DAVAR_SOURCE_ID_CHIRHO,
			language_code_chirho: languageChirho.code_chirho,
			language_name_chirho: languageChirho.name_chirho,
			language_english_chirho: languageChirho.english_chirho,
			version_chirho: titleChirho,
			version_code_chirho: textOfChirho(recordChirho.abbr) || recordingChirho,
			// The library names no reader and does not say how its recordings are voiced.
			voice_chirho: '',
			voice_kind_chirho: 'unknown',
			source_name_chirho: DAVAR_SOURCE_NAME_CHIRHO,
			source_url_chirho: DAVAR_TERMS_ADDRESS_CHIRHO,
			licence_id_chirho: 'davar-library-notice',
			licence_name_chirho:
				'Free to download and distribute, not for sale or commercial use, with the copyright notice shown',
			licence_url_chirho: DAVAR_TERMS_ADDRESS_CHIRHO,
			licence_evidence_url_chirho: DAVAR_TERMS_ADDRESS_CHIRHO,
			licence_read_on_chirho: '2026-11-13',
			credit_chirho: creditChirho,
			locator_chirho: locatorChirho,
			has_timings_chirho: false,
			coverage_chirho: coverageChirho,
			coverage_checked_on_chirho: readOnChirho,
			chapter_count_chirho: chapterCountChirho
		}
	};
}
