// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The station contract: the one shape every player reads, on the web and in the native apps.
// Everything here is plain data that survives JSON, so the same catalogue can be handed to
// Swift and Kotlin unchanged. Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { BookChirho, BookIdChirho } from './books-chirho/books_chirho';

/**
 * Raised when a field changes meaning or is removed. Adding a field does not raise it.
 * A player must skip any station whose locator or timings kind it does not know.
 */
export const CATALOGUE_CONTRACT_VERSION_CHIRHO = 1;

/** Who is speaking. 'unknown' until the maker of the recording says which. */
export type VoiceKindChirho = 'human' | 'synthetic' | 'unknown';

/** An inclusive run of chapter numbers: [first, last]. */
export type ChapterRangeChirho = readonly [first_chirho: number, last_chirho: number];

/**
 * The chapters a station was verified to have, by book. A book that is absent has none.
 * Nothing outside this map is ever resolved to an address.
 */
export type CoverageChirho = Readonly<Partial<Record<BookIdChirho, readonly ChapterRangeChirho[]>>>;

/**
 * The address of a chapter is built from the book and the chapter.
 *
 * Placeholders a template may use:
 * - `{book_upper_chirho}`       the USFM code, upper case: `JHN`
 * - `{book_lower_chirho}`       the USFM code, lower case: `jhn`
 * - `{book_code_chirho}`        the source's own code for the book, from `book_codes_chirho`
 * - `{book_order_pad2_chirho}`  the book's place in the canon, two digits: `43`
 * - `{chapter_chirho}`          the chapter number: `3`
 * - `{chapter_pad2_chirho}`     the chapter number, two digits: `03`
 * - `{chapter_pad3_chirho}`     the chapter number, three digits: `003`
 * - `{chapter_pad_book_chirho}` the chapter number, two digits or as many as the book's last
 *                               chapter has: `03` in John, `003` in Psalms
 */
export interface PatternLocatorChirho {
	readonly kind_chirho: 'pattern';
	readonly template_chirho: string;
	/** Names a list in the catalogue's `book_code_schemes_chirho`, when the source has its own codes. */
	readonly book_codes_chirho?: string;
	/**
	 * Chapters whose file is named out of pattern: by book, then by chapter number written as
	 * text, the whole address. An override wins over the template.
	 */
	readonly overrides_chirho?: Readonly<
		Partial<Record<BookIdChirho, Readonly<Record<string, string>>>>
	>;
}

/**
 * The address of every chapter is listed, for a source whose file names follow no rule.
 */
export interface IndexLocatorChirho {
	readonly kind_chirho: 'index';
	/**
	 * By book, one address per chapter, chapter 1 first. A book that is absent has no files, and
	 * `null` marks a chapter with none.
	 */
	readonly files_chirho: Readonly<Partial<Record<BookIdChirho, readonly (string | null)[]>>>;
}

/** How a station finds the audio for a chapter. One more kind will follow: a resolver. */
export type LocatorChirho = PatternLocatorChirho | IndexLocatorChirho;

/** Where a station's verse timings are, and which parser reads them. */
export interface TimingsSourceChirho {
	/** Same placeholders as a pattern locator. */
	readonly template_chirho: string;
	/**
	 * `verse-starts-list-chirho`: a JSON object whose `verses` list holds each verse's start in
	 * seconds, verse 1 first.
	 */
	readonly format_chirho: 'verse-starts-list-chirho';
}

export interface StationChirho {
	/** Stable for the life of the station. Safe to remember on a device. */
	readonly id_chirho: string;
	/** Groups the stations that come from one source. */
	readonly source_id_chirho: string;

	/** BCP 47 language tag: `en`, `hi`, `cmn`. */
	readonly language_code_chirho: string;
	/** The language's name written in that language. */
	readonly language_name_chirho: string;
	/** The language's name in English. */
	readonly language_english_chirho: string;

	/** The version's name. */
	readonly version_chirho: string;
	/** The version's short code, short enough for a dial: `BSB`. */
	readonly version_code_chirho: string;

	/** The reader's name. Empty when the maker names no reader. */
	readonly voice_chirho: string;
	readonly voice_kind_chirho: VoiceKindChirho;

	readonly source_name_chirho: string;
	readonly source_url_chirho: string;

	/** A short identifier for the licence: `CC0-1.0`, `CC-BY-SA-4.0`. */
	readonly licence_id_chirho: string;
	readonly licence_name_chirho: string;
	readonly licence_url_chirho: string;
	/** The credit to show listeners, as the licence asks for it. */
	readonly credit_chirho: string;
	/** The page where the licence of this recording was read. */
	readonly licence_evidence_url_chirho: string;
	/** The day that page was read, as YYYY-MM-DD. */
	readonly licence_read_on_chirho: string;

	readonly locator_chirho: LocatorChirho;
	readonly timings_chirho?: TimingsSourceChirho;
	/** True when `timings_chirho` is present. */
	readonly has_timings_chirho: boolean;

	readonly coverage_chirho: CoverageChirho;
	/** The day the coverage was verified against the source, as YYYY-MM-DD. */
	readonly coverage_checked_on_chirho: string;
	/** How many chapters the coverage holds. */
	readonly chapter_count_chirho: number;

	/**
	 * Chapters the recording splits across several files, by book, then by chapter number
	 * written as text. Such a chapter is excluded from the resolved coverage that older
	 * players use: it is never in `coverage_chirho` or in a locator override, and it is not
	 * counted in `chapter_count_chirho`. The pattern template could still fill in an address
	 * for it, but nothing resolves a chapter outside coverage, so a player that does not read
	 * this field simply does not offer it and can never play one part as the whole chapter.
	 * No part may be a file that a covered chapter plays. Only `resolveChapterPlaybackChirho`
	 * and the `offered` helpers see these chapters.
	 */
	readonly composite_chapters_chirho?: Readonly<
		Partial<Record<BookIdChirho, Readonly<Record<string, CompositeChapterChirho>>>>
	>;
}

/** One file of a chapter that is split across several. */
export interface ChapterPartChirho {
	readonly url_chirho: string;
	/**
	 * The length the browser reported for this file when it was measured. It proves the file's
	 * metadata could be read, not that the sound is complete or says what it should.
	 */
	readonly duration_seconds_chirho: number;
}

/** A chapter played from two to four files, in order. */
export interface CompositeChapterChirho {
	/** In playing order, the first part included. */
	readonly parts_chirho: readonly ChapterPartChirho[];
	/** The day the parts were measured, as YYYY-MM-DD. */
	readonly measured_on_chirho: string;
}

/** A book and a chapter. */
export interface ChapterRefChirho {
	readonly book_id_chirho: BookIdChirho;
	readonly chapter_chirho: number;
}

/** Where to hear a chapter. */
export interface ChapterAudioChirho {
	readonly url_chirho: string;
	/** Present when the station has verse timings. The file may still be missing for a chapter. */
	readonly timings_url_chirho?: string;
}

/** How to play a chapter: from one file, or from several in order. */
export type ChapterPlaybackChirho =
	| {
			readonly kind_chirho: 'single';
			readonly url_chirho: string;
			/** As in `ChapterAudioChirho`. */
			readonly timings_url_chirho?: string;
			/** Not known for a single file until it is loaded. */
			readonly total_seconds_chirho: null;
	  }
	| {
			readonly kind_chirho: 'composite';
			readonly parts_chirho: readonly ChapterPartChirho[];
			/** The sum of the parts' measured lengths. */
			readonly total_seconds_chirho: number;
	  };

/** The whole catalogue as one JSON-safe object, for players that do not run this module. */
export interface CatalogueChirho {
	readonly contract_version_chirho: number;
	readonly books_chirho: readonly BookChirho[];
	/** Each list has 66 entries in canon order. */
	readonly book_code_schemes_chirho: Readonly<Record<string, readonly string[]>>;
	readonly stations_chirho: readonly StationChirho[];
}
