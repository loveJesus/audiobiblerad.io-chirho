// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The questions the availability check puts to a station's host: is each chapter's audio
// there, and can each timings file be read?
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import {
	BOOKS_CHIRHO,
	type BookChirho
} from '../../src/lib/catalogue-chirho/books-chirho/books_chirho';
import type { CoverageChirho, StationChirho } from '../../src/lib/catalogue-chirho/contract_chirho';
import { resolveChapterChirho } from '../../src/lib/catalogue-chirho/locate-chirho/locate_chirho';
import { parseVerseTimingsChirho } from '../../src/lib/catalogue-chirho/locate-chirho/timings_chirho';
import type { StationDraftChirho } from '../../src/lib/catalogue-chirho/stations-chirho/station_builder_chirho';
import { failChirho } from './files_chirho';
import {
	mapPolitelyChirho,
	probeAudioChirho,
	readListingNamesChirho,
	requestChirho,
	type ProbeResultChirho
} from './probe_chirho';

/** How many listed files are also asked for directly, to confirm the listing tells the truth. */
export const LISTING_SPOT_CHECKS_CHIRHO = 5;

export interface ChapterTargetChirho {
	readonly book_chirho: BookChirho;
	readonly chapter_chirho: number;
	readonly label_chirho: string;
	readonly url_chirho: string;
	readonly timings_url_chirho: string | null;
}

const EVERY_CHAPTER_CHIRHO: CoverageChirho = Object.fromEntries(
	BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, [[1, bookChirho.chapters_chirho]]])
);

function progressChirho(labelChirho: string, totalChirho: number): (doneChirho: number) => void {
	return (doneChirho) => {
		if (doneChirho % 200 === 0 || doneChirho === totalChirho) {
			console.log(`  ${labelChirho}: ${doneChirho} of ${totalChirho}`);
		}
	};
}

/**
 * Every chapter the station could have, with the address a player would be given for it.
 *
 * The addresses come from the catalogue's own resolver, run on the draft as though it had every
 * chapter, so what is checked here is exactly what will be played. A pattern must give an
 * address for every chapter; an index simply may not list one.
 */
export function listTargetsChirho(draftChirho: StationDraftChirho): ChapterTargetChirho[] {
	const candidateChirho: StationChirho = {
		...draftChirho,
		has_timings_chirho: draftChirho.timings_chirho !== undefined,
		coverage_chirho: EVERY_CHAPTER_CHIRHO,
		coverage_checked_on_chirho: '',
		chapter_count_chirho: 0
	};
	const mustAnswerChirho = draftChirho.locator_chirho.kind_chirho === 'pattern';
	const targetsChirho: ChapterTargetChirho[] = [];
	for (const bookChirho of BOOKS_CHIRHO) {
		for (let chapterChirho = 1; chapterChirho <= bookChirho.chapters_chirho; chapterChirho += 1) {
			const labelChirho = `${bookChirho.id_chirho} ${chapterChirho}`;
			const audioChirho = resolveChapterChirho(
				candidateChirho,
				bookChirho.id_chirho,
				chapterChirho
			);
			if (!audioChirho) {
				if (mustAnswerChirho) {
					failChirho(`${draftChirho.id_chirho}: no address could be built for ${labelChirho}`);
				}
				continue;
			}
			if (draftChirho.timings_chirho && audioChirho.timings_url_chirho === undefined) {
				failChirho(
					`${draftChirho.id_chirho}: no timings address could be built for ${labelChirho}`
				);
			}
			targetsChirho.push({
				book_chirho: bookChirho,
				chapter_chirho: chapterChirho,
				label_chirho: labelChirho,
				url_chirho: audioChirho.url_chirho,
				timings_url_chirho: audioChirho.timings_url_chirho ?? null
			});
		}
	}
	return targetsChirho;
}

/** One HEAD request per chapter. */
export async function probeEachChirho(
	targetsChirho: readonly ChapterTargetChirho[],
	workersChirho: number,
	pauseMsChirho: number
): Promise<ProbeResultChirho[]> {
	const resultsChirho = await mapPolitelyChirho(
		targetsChirho,
		workersChirho,
		pauseMsChirho,
		(targetChirho) => probeAudioChirho(targetChirho.url_chirho),
		progressChirho('audio', targetsChirho.length)
	);

	// A host that starts refusing a client answers 403 for everything, which would read as
	// "absent". Ask a second time for whatever looked absent, and make sure a file that was
	// there at the start is still there at the end.
	const absentIndexesChirho = resultsChirho.flatMap((resultChirho, indexChirho) =>
		resultChirho.verdict_chirho === 'absent' ? [indexChirho] : []
	);
	const secondAnswersChirho = await mapPolitelyChirho(
		absentIndexesChirho,
		workersChirho,
		pauseMsChirho,
		(indexChirho) => probeAudioChirho(targetsChirho[indexChirho].url_chirho),
		progressChirho('second look at absent chapters', absentIndexesChirho.length)
	);
	absentIndexesChirho.forEach((indexChirho, positionChirho) => {
		resultsChirho[indexChirho] = secondAnswersChirho[positionChirho];
	});
	const witnessIndexChirho = resultsChirho.findIndex(
		(resultChirho) => resultChirho.verdict_chirho === 'present'
	);
	if (absentIndexesChirho.length > 0 && witnessIndexChirho !== -1) {
		const witnessChirho = await probeAudioChirho(targetsChirho[witnessIndexChirho].url_chirho);
		if (witnessChirho.verdict_chirho !== 'present') {
			return resultsChirho.map((resultChirho) =>
				resultChirho.verdict_chirho === 'absent'
					? {
							...resultChirho,
							verdict_chirho: 'unverified',
							note_chirho: 'the host began refusing'
						}
					: resultChirho
			);
		}
	}
	return resultsChirho;
}

/** One folder listing answers for every chapter; a few files are then asked for directly. */
export async function probeByListingChirho(
	targetsChirho: readonly ChapterTargetChirho[]
): Promise<ProbeResultChirho[]> {
	const listingsChirho = new Map<string, Set<string> | null>();
	const resultsChirho: ProbeResultChirho[] = [];
	for (const targetChirho of targetsChirho) {
		const cutChirho = targetChirho.url_chirho.lastIndexOf('/') + 1;
		const folderChirho = targetChirho.url_chirho.slice(0, cutChirho);
		if (!listingsChirho.has(folderChirho)) {
			listingsChirho.set(folderChirho, await readListingNamesChirho(folderChirho));
		}
		const namesChirho = listingsChirho.get(folderChirho);
		if (!namesChirho) {
			resultsChirho.push({
				verdict_chirho: 'unverified',
				status_chirho: 0,
				bytes_chirho: 0,
				note_chirho: 'the folder listing could not be read'
			});
		} else if (namesChirho.has(decodeURIComponent(targetChirho.url_chirho.slice(cutChirho)))) {
			resultsChirho.push({
				verdict_chirho: 'present',
				status_chirho: 200,
				bytes_chirho: 0,
				note_chirho: ''
			});
		} else {
			resultsChirho.push({
				verdict_chirho: 'absent',
				status_chirho: 404,
				bytes_chirho: 0,
				note_chirho: 'not in the folder listing'
			});
		}
	}

	const presentIndexesChirho = resultsChirho.flatMap((resultChirho, indexChirho) =>
		resultChirho.verdict_chirho === 'present' ? [indexChirho] : []
	);
	const stepChirho = Math.max(
		1,
		Math.floor(presentIndexesChirho.length / LISTING_SPOT_CHECKS_CHIRHO)
	);
	const spotIndexesChirho = new Set(
		presentIndexesChirho.filter((_indexChirho, positionChirho) => positionChirho % stepChirho === 0)
	);
	if (presentIndexesChirho.length > 0) spotIndexesChirho.add(presentIndexesChirho.at(-1)!);
	for (const indexChirho of spotIndexesChirho) {
		const directChirho = await probeAudioChirho(targetsChirho[indexChirho].url_chirho);
		console.log(
			`  spot check ${targetsChirho[indexChirho].label_chirho}: ${directChirho.verdict_chirho}, ${directChirho.bytes_chirho} bytes`
		);
		if (directChirho.verdict_chirho !== 'present') {
			// The listing and the file disagree, so the listing cannot be trusted for anything.
			return resultsChirho.map((resultChirho) => ({
				...resultChirho,
				verdict_chirho: 'unverified' as const,
				note_chirho: `the listing names ${targetsChirho[indexChirho].label_chirho} but the file answered ${directChirho.status_chirho}`
			}));
		}
		resultsChirho[indexChirho] = directChirho;
	}
	return resultsChirho;
}

/** Fetch and read every timings file. Reports the chapters with none, and with an unreadable one. */
export async function checkTimingsChirho(
	draftChirho: StationDraftChirho,
	targetsChirho: readonly ChapterTargetChirho[],
	workersChirho: number,
	pauseMsChirho: number
): Promise<Record<string, unknown>> {
	const stationChirho = { timings_chirho: draftChirho.timings_chirho } as StationChirho;
	const verdictsChirho = await mapPolitelyChirho(
		targetsChirho,
		workersChirho,
		pauseMsChirho,
		async (targetChirho): Promise<'read' | 'absent' | 'unreadable'> => {
			const responseChirho = await requestChirho(targetChirho.timings_url_chirho!, 'GET');
			if (!responseChirho || responseChirho.status !== 200) return 'absent';
			try {
				const startsChirho = parseVerseTimingsChirho(stationChirho, await responseChirho.json());
				return startsChirho === null ? 'unreadable' : 'read';
			} catch {
				return 'unreadable';
			}
		},
		progressChirho('timings', targetsChirho.length)
	);
	const labelsChirho = (wantedChirho: string): string[] =>
		targetsChirho
			.filter((_targetChirho, indexChirho) => verdictsChirho[indexChirho] === wantedChirho)
			.map((targetChirho) => targetChirho.label_chirho);
	return {
		chapters_with_timings_chirho: labelsChirho('read').length,
		chapters_without_timings_chirho: labelsChirho('absent'),
		chapters_with_unreadable_timings_chirho: labelsChirho('unreadable')
	};
}
