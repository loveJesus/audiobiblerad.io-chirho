// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Coverage: the chapters a station was measured to have. The availability check writes it,
// one file per source, and the catalogue reads it back through here.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from '../books-chirho/books_chirho';
import type { ChapterRangeChirho, CoverageChirho } from '../contract_chirho';

/** One source's coverage file, as `scripts-chirho/catalogue-chirho/` writes it. */
export interface CoverageFileChirho {
	readonly source_id_chirho: string;
	/** By station id: `{ checked_on_chirho, available_chirho }`. Read with `readStationCoverageChirho`. */
	readonly stations_chirho: Readonly<Record<string, unknown>>;
}

export interface StationCoverageChirho {
	/** The day the check ran, as YYYY-MM-DD. Empty when the station was never checked. */
	readonly checked_on_chirho: string;
	readonly coverage_chirho: CoverageChirho;
}

function readRangeChirho(valueChirho: unknown, chaptersChirho: number): ChapterRangeChirho | null {
	if (!Array.isArray(valueChirho) || valueChirho.length !== 2) return null;
	const [firstChirho, lastChirho]: unknown[] = valueChirho;
	if (typeof firstChirho !== 'number' || typeof lastChirho !== 'number') return null;
	if (!Number.isInteger(firstChirho) || !Number.isInteger(lastChirho)) return null;
	if (firstChirho < 1 || lastChirho > chaptersChirho || firstChirho > lastChirho) return null;
	return [firstChirho, lastChirho];
}

/**
 * Read one station's entry from a coverage file. Anything that is not a real run of chapters
 * inside a real book is dropped, so a damaged file can only ever make a station smaller.
 * A station with no entry has no chapters.
 */
export function readStationCoverageChirho(
	fileChirho: CoverageFileChirho,
	stationIdChirho: string
): StationCoverageChirho {
	const entryChirho = fileChirho.stations_chirho[stationIdChirho];
	if (typeof entryChirho !== 'object' || entryChirho === null) {
		return { checked_on_chirho: '', coverage_chirho: {} };
	}
	const { checked_on_chirho: checkedOnChirho, available_chirho: availableChirho } = entryChirho as {
		checked_on_chirho?: unknown;
		available_chirho?: unknown;
	};

	return {
		checked_on_chirho: typeof checkedOnChirho === 'string' ? checkedOnChirho : '',
		coverage_chirho: readCoverageChirho(availableChirho)
	};
}

/**
 * Read a coverage value from anywhere it may have been damaged: a file, the network. Anything
 * that is not a real run of chapters inside a real book is dropped.
 */
export function readCoverageChirho(valueChirho: unknown): CoverageChirho {
	const coverageChirho: Partial<Record<string, ChapterRangeChirho[]>> = {};
	if (typeof valueChirho !== 'object' || valueChirho === null) return coverageChirho;
	const rawChirho = valueChirho as Record<string, unknown>;
	for (const bookChirho of BOOKS_CHIRHO) {
		const rawRangesChirho = rawChirho[bookChirho.id_chirho];
		if (!Array.isArray(rawRangesChirho)) continue;
		const rangesChirho = rawRangesChirho
			.map((rangeChirho) => readRangeChirho(rangeChirho, bookChirho.chapters_chirho))
			.filter((rangeChirho) => rangeChirho !== null);
		if (rangesChirho.length > 0) coverageChirho[bookChirho.id_chirho] = rangesChirho;
	}
	return coverageChirho;
}

export function countChaptersChirho(coverageChirho: CoverageChirho): number {
	let countChirho = 0;
	for (const rangesChirho of Object.values(coverageChirho)) {
		for (const [firstChirho, lastChirho] of rangesChirho ?? []) {
			countChirho += lastChirho - firstChirho + 1;
		}
	}
	return countChirho;
}

/** Turn chapter numbers into sorted inclusive runs: 1, 2, 3, 5 becomes [1, 3] and [5, 5]. */
export function chaptersToRangesChirho(chaptersChirho: readonly number[]): ChapterRangeChirho[] {
	const sortedChirho = [...new Set(chaptersChirho)].sort((aChirho, bChirho) => aChirho - bChirho);
	const rangesChirho: [number, number][] = [];
	for (const chapterChirho of sortedChirho) {
		const lastRangeChirho = rangesChirho.at(-1);
		if (lastRangeChirho && lastRangeChirho[1] === chapterChirho - 1) {
			lastRangeChirho[1] = chapterChirho;
		} else {
			rangesChirho.push([chapterChirho, chapterChirho]);
		}
	}
	return rangesChirho;
}
