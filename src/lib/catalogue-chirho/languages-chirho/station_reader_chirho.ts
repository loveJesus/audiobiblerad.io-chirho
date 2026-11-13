// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Reading a station that arrived at run time. The built-in stations are checked when the app
// is built; a station fetched later has crossed a network and perhaps a stale cache, so it is
// taken only when every part of it is well formed. A station that is not is dropped whole.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO, findBookChirho } from '../books-chirho/books_chirho';
import { BOOK_CODE_SCHEMES_CHIRHO } from '../books-chirho/book_code_schemes_chirho';
import type { PatternLocatorChirho, StationChirho, VoiceKindChirho } from '../contract_chirho';
import { resolveChapterChirho } from '../locate-chirho/locate_chirho';
import { countChaptersChirho, readCoverageChirho } from '../stations-chirho/coverage_chirho';

const ID_PATTERN_CHIRHO = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LANGUAGE_CODE_PATTERN_CHIRHO = /^[a-z]{2,3}(-[A-Za-z0-9]+)*$/;
const DAY_PATTERN_CHIRHO = /^\d{4}-\d{2}-\d{2}$/;
const VOICE_KINDS_CHIRHO: readonly string[] = ['human', 'synthetic', 'unknown'];

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

function isFilledTextChirho(valueChirho: unknown): valueChirho is string {
	return typeof valueChirho === 'string' && valueChirho.trim() !== '';
}

/** A secure address already in the form a browser reports it. */
export function isPlainSecureAddressChirho(valueChirho: unknown): valueChirho is string {
	return (
		typeof valueChirho === 'string' &&
		URL.canParse(valueChirho) &&
		new URL(valueChirho).protocol === 'https:' &&
		new URL(valueChirho).href === valueChirho
	);
}

function readPatternLocatorChirho(valueChirho: unknown): PatternLocatorChirho | null {
	if (!isRecordChirho(valueChirho) || valueChirho.kind_chirho !== 'pattern') return null;
	const templateChirho = valueChirho.template_chirho;
	if (typeof templateChirho !== 'string' || !templateChirho.startsWith('https://')) return null;

	const bookCodesChirho = valueChirho.book_codes_chirho;
	if (bookCodesChirho !== undefined) {
		if (
			typeof bookCodesChirho !== 'string' ||
			!Object.hasOwn(BOOK_CODE_SCHEMES_CHIRHO, bookCodesChirho)
		) {
			return null;
		}
	}

	const rawOverridesChirho = valueChirho.overrides_chirho;
	let overridesChirho: Record<string, Record<string, string>> | undefined;
	if (rawOverridesChirho !== undefined) {
		if (!isRecordChirho(rawOverridesChirho)) return null;
		overridesChirho = {};
		for (const [bookIdChirho, chaptersChirho] of Object.entries(rawOverridesChirho)) {
			const bookChirho = findBookChirho(bookIdChirho);
			if (!bookChirho || !isRecordChirho(chaptersChirho)) return null;
			const readChirho: Record<string, string> = {};
			for (const [chapterTextChirho, addressChirho] of Object.entries(chaptersChirho)) {
				const chapterChirho = Number(chapterTextChirho);
				if (
					!/^[1-9]\d*$/.test(chapterTextChirho) ||
					chapterChirho > bookChirho.chapters_chirho ||
					!isPlainSecureAddressChirho(addressChirho)
				) {
					// A wrong override would play the wrong file under a chapter's name.
					return null;
				}
				readChirho[chapterTextChirho] = addressChirho;
			}
			overridesChirho[bookChirho.id_chirho] = readChirho;
		}
	}
	return {
		kind_chirho: 'pattern',
		template_chirho: templateChirho,
		...(bookCodesChirho === undefined ? {} : { book_codes_chirho: bookCodesChirho }),
		...(overridesChirho === undefined ? {} : { overrides_chirho: overridesChirho })
	};
}

/**
 * Read a station from a value that may not be one. Returns the station rebuilt from the
 * fields the contract names and nothing else, or nothing when any part fails:
 * - its names, licence, credit and dates are present, and its addresses are secure;
 * - its locator is a pattern this code can fill, with every override a real chapter;
 * - its coverage holds at least one real chapter, and every chapter it holds resolves to a
 *   secure address in the form a browser reports.
 * The chapter count is counted here, not believed.
 */
export function readStationChirho(valueChirho: unknown): StationChirho | null {
	if (!isRecordChirho(valueChirho)) return null;
	const {
		id_chirho: idChirho,
		language_code_chirho: languageCodeChirho,
		voice_chirho: voiceChirho,
		voice_kind_chirho: voiceKindChirho
	} = valueChirho;
	if (typeof idChirho !== 'string' || !ID_PATTERN_CHIRHO.test(idChirho)) return null;
	if (
		typeof languageCodeChirho !== 'string' ||
		!LANGUAGE_CODE_PATTERN_CHIRHO.test(languageCodeChirho)
	) {
		return null;
	}
	if (typeof voiceChirho !== 'string') return null;
	if (typeof voiceKindChirho !== 'string' || !VOICE_KINDS_CHIRHO.includes(voiceKindChirho)) {
		return null;
	}

	const textChirho = {
		source_id_chirho: valueChirho.source_id_chirho,
		language_name_chirho: valueChirho.language_name_chirho,
		language_english_chirho: valueChirho.language_english_chirho,
		version_chirho: valueChirho.version_chirho,
		version_code_chirho: valueChirho.version_code_chirho,
		source_name_chirho: valueChirho.source_name_chirho,
		licence_id_chirho: valueChirho.licence_id_chirho,
		licence_name_chirho: valueChirho.licence_name_chirho,
		credit_chirho: valueChirho.credit_chirho
	};
	const addressesChirho = {
		source_url_chirho: valueChirho.source_url_chirho,
		licence_url_chirho: valueChirho.licence_url_chirho,
		licence_evidence_url_chirho: valueChirho.licence_evidence_url_chirho
	};
	const daysChirho = {
		licence_read_on_chirho: valueChirho.licence_read_on_chirho,
		coverage_checked_on_chirho: valueChirho.coverage_checked_on_chirho
	};
	if (!Object.values(textChirho).every(isFilledTextChirho)) return null;
	if (!Object.values(addressesChirho).every(isPlainSecureAddressChirho)) return null;
	if (
		!Object.values(daysChirho).every(
			(dayChirho) => typeof dayChirho === 'string' && DAY_PATTERN_CHIRHO.test(dayChirho)
		)
	) {
		return null;
	}
	// A station loaded at run time has no verse timings yet; one that claims them is not read.
	if (valueChirho.timings_chirho !== undefined) return null;

	const locatorChirho = readPatternLocatorChirho(valueChirho.locator_chirho);
	if (!locatorChirho) return null;
	const coverageChirho = readCoverageChirho(valueChirho.coverage_chirho);
	const chapterCountChirho = countChaptersChirho(coverageChirho);
	if (chapterCountChirho === 0) return null;

	const stationChirho: StationChirho = {
		id_chirho: idChirho,
		language_code_chirho: languageCodeChirho,
		voice_chirho: voiceChirho,
		voice_kind_chirho: voiceKindChirho as VoiceKindChirho,
		...(textChirho as Record<keyof typeof textChirho, string>),
		...(addressesChirho as Record<keyof typeof addressesChirho, string>),
		...(daysChirho as Record<keyof typeof daysChirho, string>),
		locator_chirho: locatorChirho,
		has_timings_chirho: false,
		coverage_chirho: coverageChirho,
		chapter_count_chirho: chapterCountChirho
	};
	for (const bookChirho of BOOKS_CHIRHO) {
		for (const [firstChirho, lastChirho] of coverageChirho[bookChirho.id_chirho] ?? []) {
			for (let chapterChirho = firstChirho; chapterChirho <= lastChirho; chapterChirho += 1) {
				const audioChirho = resolveChapterChirho(
					stationChirho,
					bookChirho.id_chirho,
					chapterChirho
				);
				if (!audioChirho || !isPlainSecureAddressChirho(audioChirho.url_chirho)) return null;
			}
		}
	}
	return stationChirho;
}
