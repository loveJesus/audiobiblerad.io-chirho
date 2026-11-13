// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Measures which chapters each station of one source really has, and writes the result where
// the catalogue reads it. A station plays only what this check found.
//
//   bun scripts-chirho/catalogue-chirho/check_availability_chirho.ts <source> [--station <id>]
//       [--workers 4] [--pause-ms 80]
//
// Writes, for the source:
//   src/lib/catalogue-chirho/stations-chirho/coverage-chirho/<source>_coverage_chirho.json
//   spec-chirho/evidence-chirho/catalogue-chirho/<source>_availability_chirho.json
//
// A station whose check could not be completed keeps its previous coverage, and the run exits
// with an error: a host that is briefly unwell must never make a station look smaller.
// Run write_station_register_chirho.ts afterwards, so the record matches what ships.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from '../../src/lib/catalogue-chirho/books-chirho/books_chirho';
import { chaptersToRangesChirho } from '../../src/lib/catalogue-chirho/stations-chirho/coverage_chirho';
import type { StationDraftChirho } from '../../src/lib/catalogue-chirho/stations-chirho/station_builder_chirho';
import {
	STATION_SOURCES_CHIRHO,
	allDraftsOfChirho
} from '../../src/lib/catalogue-chirho/stations-chirho/station_sources_chirho';
import {
	catalogueFileChirho,
	failChirho,
	mergeStationEntriesChirho,
	todayChirho
} from './files_chirho';
import type { ProbeResultChirho } from './probe_chirho';
import {
	LISTING_SPOT_CHECKS_CHIRHO,
	checkTimingsChirho,
	listTargetsChirho,
	probeByListingChirho,
	probeEachChirho
} from './station_probes_chirho';

/** Sources whose host publishes a plain folder listing: one request answers for every chapter. */
const LISTING_SOURCES_CHIRHO: ReadonlySet<string> = new Set(['openbible', 'ebible']);

const ALL_CHAPTERS_CHIRHO = BOOKS_CHIRHO.reduce(
	(sumChirho, bookChirho) => sumChirho + bookChirho.chapters_chirho,
	0
);

interface StationReportChirho {
	readonly complete_chirho: boolean;
	readonly coverage_entry_chirho: Record<string, unknown>;
	readonly evidence_entry_chirho: Record<string, unknown>;
}

function readFlagChirho(
	argumentsChirho: readonly string[],
	nameChirho: string
): string | undefined {
	const indexChirho = argumentsChirho.indexOf(nameChirho);
	return indexChirho === -1 ? undefined : argumentsChirho[indexChirho + 1];
}

/** As a person would write it: `JDG 2-8, 16, 21`. */
function describeRunsChirho(bookIdChirho: string, chaptersChirho: readonly number[]): string {
	const runsChirho = chaptersToRangesChirho(chaptersChirho).map(([firstChirho, lastChirho]) =>
		firstChirho === lastChirho ? `${firstChirho}` : `${firstChirho}-${lastChirho}`
	);
	return `${bookIdChirho} ${runsChirho.join(', ')}`;
}

async function checkStationChirho(
	draftChirho: StationDraftChirho,
	checkedOnChirho: string,
	workersChirho: number,
	pauseMsChirho: number
): Promise<StationReportChirho> {
	console.log(`${draftChirho.id_chirho}`);
	const targetsChirho = listTargetsChirho(draftChirho);
	const byListingChirho = LISTING_SOURCES_CHIRHO.has(draftChirho.source_id_chirho);
	const resultsChirho = byListingChirho
		? await probeByListingChirho(targetsChirho)
		: await probeEachChirho(targetsChirho, workersChirho, pauseMsChirho);

	const availableChirho: Record<string, unknown> = {};
	const absentByBookChirho: string[] = [];
	for (const bookChirho of BOOKS_CHIRHO) {
		const chaptersWithChirho = (wantedChirho: string): number[] =>
			targetsChirho
				.filter(
					(targetChirho, indexChirho) =>
						targetChirho.book_chirho === bookChirho &&
						resultsChirho[indexChirho].verdict_chirho === wantedChirho
				)
				.map((targetChirho) => targetChirho.chapter_chirho);
		const presentChaptersChirho = chaptersWithChirho('present');
		if (presentChaptersChirho.length > 0) {
			availableChirho[bookChirho.id_chirho] = chaptersToRangesChirho(presentChaptersChirho);
		}
		const absentChaptersChirho = chaptersWithChirho('absent');
		if (absentChaptersChirho.length > 0) {
			absentByBookChirho.push(describeRunsChirho(bookChirho.id_chirho, absentChaptersChirho));
		}
	}

	const withVerdictChirho = (wantedChirho: string): ProbeResultChirho[] =>
		resultsChirho.filter((resultChirho) => resultChirho.verdict_chirho === wantedChirho);
	const presentChirho = withVerdictChirho('present');
	const absentChirho = withVerdictChirho('absent');
	// How the host answered for the absent chapters, counted: `{ "status 404": 623 }`.
	const absentAnswersChirho: Record<string, number> = {};
	for (const resultChirho of absentChirho) {
		const answerChirho = resultChirho.note_chirho || `status ${resultChirho.status_chirho}`;
		absentAnswersChirho[answerChirho] = (absentAnswersChirho[answerChirho] ?? 0) + 1;
	}
	const unverifiedChirho = targetsChirho.flatMap((targetChirho, indexChirho) => {
		const resultChirho = resultsChirho[indexChirho];
		if (resultChirho.verdict_chirho !== 'unverified') return [];
		const detailChirho = resultChirho.note_chirho || `status ${resultChirho.status_chirho}`;
		return [`${targetChirho.label_chirho} (${detailChirho})`];
	});
	const sizesChirho = presentChirho
		.map((resultChirho) => resultChirho.bytes_chirho)
		.filter((bytesChirho) => bytesChirho > 0);

	const evidenceChirho: Record<string, unknown> = {
		checked_on_chirho: checkedOnChirho,
		method_chirho: byListingChirho
			? `the host's own folder listing, then ${LISTING_SPOT_CHECKS_CHIRHO} or more files asked for directly`
			: 'one HEAD request per chapter address',
		chapters_asked_chirho: targetsChirho.length,
		chapters_found_chirho: presentChirho.length,
		chapters_absent_chirho: absentChirho.length,
		absent_by_book_chirho: absentByBookChirho,
		absent_answers_chirho: absentAnswersChirho,
		chapters_unverified_chirho: unverifiedChirho
	};
	if (targetsChirho.length < ALL_CHAPTERS_CHIRHO) {
		// An index lists only the chapters its source has; the rest were never asked for.
		evidenceChirho.chapters_with_no_address_chirho = ALL_CHAPTERS_CHIRHO - targetsChirho.length;
	}
	if (!byListingChirho && sizesChirho.length > 0) {
		evidenceChirho.bytes_total_chirho = sizesChirho.reduce(
			(sumChirho, bytesChirho) => sumChirho + bytesChirho,
			0
		);
		evidenceChirho.bytes_smallest_chapter_chirho = Math.min(...sizesChirho);
		evidenceChirho.bytes_largest_chapter_chirho = Math.max(...sizesChirho);
	}
	if (draftChirho.timings_chirho && unverifiedChirho.length === 0) {
		const timedTargetsChirho = targetsChirho.filter(
			(_targetChirho, indexChirho) => resultsChirho[indexChirho].verdict_chirho === 'present'
		);
		evidenceChirho.timings_chirho = await checkTimingsChirho(
			draftChirho,
			timedTargetsChirho,
			workersChirho,
			pauseMsChirho
		);
	}

	console.log(
		`  found ${presentChirho.length} of ${targetsChirho.length}; absent ${absentChirho.length}; unverified ${unverifiedChirho.length}`
	);
	return {
		complete_chirho: unverifiedChirho.length === 0,
		coverage_entry_chirho: {
			checked_on_chirho: checkedOnChirho,
			available_chirho: availableChirho
		},
		evidence_entry_chirho: evidenceChirho
	};
}

const argumentsChirho = process.argv.slice(2);
const sourceIdChirho = argumentsChirho[0];
const sourceChirho = STATION_SOURCES_CHIRHO.find(
	(candidateChirho) => candidateChirho.source_id_chirho === sourceIdChirho
);
if (!sourceChirho) {
	failChirho(
		`usage: check_availability_chirho.ts <${STATION_SOURCES_CHIRHO.map((candidateChirho) => candidateChirho.source_id_chirho).join('|')}> [--station <id>] [--workers 4] [--pause-ms 80]`
	);
}
const onlyStationChirho = readFlagChirho(argumentsChirho, '--station');
const workersChirho = Number(readFlagChirho(argumentsChirho, '--workers') ?? '4');
const pauseMsChirho = Number(readFlagChirho(argumentsChirho, '--pause-ms') ?? '80');
// Held stations are measured like the rest, so that releasing one needs no new check.
const draftsChirho = allDraftsOfChirho(sourceChirho).filter(
	(draftChirho) => !onlyStationChirho || draftChirho.id_chirho === onlyStationChirho
);
if (draftsChirho.length === 0) {
	failChirho(`no station "${onlyStationChirho}" in source "${sourceIdChirho}"`);
}

const checkedOnChirho = todayChirho();
const coverageEntriesChirho: Record<string, unknown> = {};
const evidenceEntriesChirho: Record<string, unknown> = {};
const incompleteChirho: string[] = [];
for (const draftChirho of draftsChirho) {
	const reportChirho = await checkStationChirho(
		draftChirho,
		checkedOnChirho,
		workersChirho,
		pauseMsChirho
	);
	evidenceEntriesChirho[draftChirho.id_chirho] = reportChirho.evidence_entry_chirho;
	if (reportChirho.complete_chirho) {
		coverageEntriesChirho[draftChirho.id_chirho] = reportChirho.coverage_entry_chirho;
	} else {
		incompleteChirho.push(draftChirho.id_chirho);
	}
}

await mergeStationEntriesChirho(
	catalogueFileChirho('coverage', `${sourceIdChirho}_coverage_chirho.json`),
	sourceIdChirho,
	coverageEntriesChirho
);
await mergeStationEntriesChirho(
	catalogueFileChirho('evidence', `${sourceIdChirho}_availability_chirho.json`),
	sourceIdChirho,
	evidenceEntriesChirho
);

if (incompleteChirho.length > 0) {
	failChirho(
		`Could not finish: ${incompleteChirho.join(', ')}. Their previous coverage was kept. See the evidence file for what went unanswered.`
	);
}
console.log('done');
