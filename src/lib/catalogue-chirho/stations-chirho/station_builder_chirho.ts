// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Joins what a person wrote about a station (who made it, under which licence, where its files
// are) with what the availability check measured (which chapters really exist).
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { StationChirho } from '../contract_chirho';
import {
	countChaptersChirho,
	readStationCoverageChirho,
	type CoverageFileChirho
} from './coverage_chirho';

/** Everything about a station except what the availability check measures. */
export type StationDraftChirho = Omit<
	StationChirho,
	'has_timings_chirho' | 'coverage_chirho' | 'coverage_checked_on_chirho' | 'chapter_count_chirho'
>;

/** A complete station: the draft, plus the chapters the availability check found. */
export function buildStationChirho(
	draftChirho: StationDraftChirho,
	fileChirho: CoverageFileChirho
): StationChirho {
	const { checked_on_chirho: checkedOnChirho, coverage_chirho: coverageChirho } =
		readStationCoverageChirho(fileChirho, draftChirho.id_chirho);
	return {
		...draftChirho,
		has_timings_chirho: draftChirho.timings_chirho !== undefined,
		coverage_chirho: coverageChirho,
		coverage_checked_on_chirho: checkedOnChirho,
		chapter_count_chirho: countChaptersChirho(coverageChirho)
	};
}
