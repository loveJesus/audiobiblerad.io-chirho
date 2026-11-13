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
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { readFile, writeFile } from 'node:fs/promises';
import * as prettierChirho from 'prettier';
import { BOOKS_CHIRHO, type BookChirho } from '../../src/lib/catalogue-chirho/books_chirho';
import type { StationChirho } from '../../src/lib/catalogue-chirho/contract_chirho';
import { expandTemplateChirho } from '../../src/lib/catalogue-chirho/locate_chirho';
import { chaptersToRangesChirho } from '../../src/lib/catalogue-chirho/stations-chirho/coverage_chirho';
import type { StationDraftChirho } from '../../src/lib/catalogue-chirho/stations-chirho/station_builder_chirho';
import { STATION_SOURCES_CHIRHO } from '../../src/lib/catalogue-chirho/stations-chirho/station_sources_chirho';
import { parseVerseTimingsChirho } from '../../src/lib/catalogue-chirho/timings_chirho';
import {
	mapPolitelyChirho,
	probeAudioChirho,
	readListingNamesChirho,
	requestChirho,
	type ProbeResultChirho
} from './probe_chirho';

/** Sources whose host publishes a plain folder listing: one request answers for every chapter. */
const LISTING_SOURCES_CHIRHO: ReadonlySet<string> = new Set(['openbible']);
/** How many listed files are also asked for directly, to confirm the listing tells the truth. */
const LISTING_SPOT_CHECKS_CHIRHO = 5;

const ROOT_CHIRHO = new URL('../../', import.meta.url);

interface ChapterTargetChirho {
	readonly book_chirho: BookChirho;
	readonly chapter_chirho: number;
	readonly label_chirho: string;
	readonly url_chirho: string;
	readonly timings_url_chirho: string | null;
}

interface StationReportChirho {
	readonly complete_chirho: boolean;
	readonly coverage_entry_chirho: Record<string, unknown>;
	readonly evidence_entry_chirho: Record<string, unknown>;
}

function failChirho(messageChirho: string): never {
	console.error(messageChirho);
	process.exit(1);
}

function readFlagChirho(
	argumentsChirho: readonly string[],
	nameChirho: string
): string | undefined {
	const indexChirho = argumentsChirho.indexOf(nameChirho);
	return indexChirho === -1 ? undefined : argumentsChirho[indexChirho + 1];
}

function listTargetsChirho(draftChirho: StationDraftChirho): ChapterTargetChirho[] {
	const targetsChirho: ChapterTargetChirho[] = [];
	for (const bookChirho of BOOKS_CHIRHO) {
		for (let chapterChirho = 1; chapterChirho <= bookChirho.chapters_chirho; chapterChirho += 1) {
			const codesChirho = draftChirho.locator_chirho.book_codes_chirho;
			const urlChirho = expandTemplateChirho(
				draftChirho.locator_chirho.template_chirho,
				bookChirho,
				chapterChirho,
				codesChirho
			);
			const timingsUrlChirho = draftChirho.timings_chirho
				? expandTemplateChirho(
						draftChirho.timings_chirho.template_chirho,
						bookChirho,
						chapterChirho,
						codesChirho
					)
				: null;
			if (urlChirho === null || (draftChirho.timings_chirho && timingsUrlChirho === null)) {
				failChirho(
					`${draftChirho.id_chirho}: a template could not be filled for ${bookChirho.id_chirho} ${chapterChirho}`
				);
			}
			targetsChirho.push({
				book_chirho: bookChirho,
				chapter_chirho: chapterChirho,
				label_chirho: `${bookChirho.id_chirho} ${chapterChirho}`,
				url_chirho: urlChirho,
				timings_url_chirho: timingsUrlChirho
			});
		}
	}
	return targetsChirho;
}

function progressChirho(labelChirho: string, totalChirho: number): (doneChirho: number) => void {
	return (doneChirho) => {
		if (doneChirho % 200 === 0 || doneChirho === totalChirho) {
			console.log(`  ${labelChirho}: ${doneChirho} of ${totalChirho}`);
		}
	};
}

/** One HEAD request per chapter. */
async function probeEachChirho(
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
	// "absent". Ask again, slowly, for whatever looked absent, and make sure a file that was
	// there at the start is still there at the end.
	const absentIndexesChirho = resultsChirho.flatMap((resultChirho, indexChirho) =>
		resultChirho.verdict_chirho === 'absent' ? [indexChirho] : []
	);
	for (const indexChirho of absentIndexesChirho) {
		resultsChirho[indexChirho] = await probeAudioChirho(targetsChirho[indexChirho].url_chirho);
	}
	const witnessIndexChirho = resultsChirho.findIndex(
		(resultChirho) => resultChirho.verdict_chirho === 'present'
	);
	if (absentIndexesChirho.length > 0 && witnessIndexChirho !== -1) {
		const againChirho = await probeAudioChirho(targetsChirho[witnessIndexChirho].url_chirho);
		if (againChirho.verdict_chirho !== 'present') {
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
async function probeByListingChirho(
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

/** Fetch and read every timings file. Returns the chapters with none, and with an unreadable one. */
async function checkTimingsChirho(
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
	for (const bookChirho of BOOKS_CHIRHO) {
		const chaptersChirho = targetsChirho
			.filter(
				(targetChirho, indexChirho) =>
					targetChirho.book_chirho === bookChirho &&
					resultsChirho[indexChirho].verdict_chirho === 'present'
			)
			.map((targetChirho) => targetChirho.chapter_chirho);
		if (chaptersChirho.length > 0) {
			availableChirho[bookChirho.id_chirho] = chaptersToRangesChirho(chaptersChirho);
		}
	}

	const describeChirho = (wantedChirho: string): string[] =>
		targetsChirho.flatMap((targetChirho, indexChirho) => {
			const resultChirho = resultsChirho[indexChirho];
			if (resultChirho.verdict_chirho !== wantedChirho) return [];
			const detailChirho = resultChirho.note_chirho || `status ${resultChirho.status_chirho}`;
			return [`${targetChirho.label_chirho} (${detailChirho})`];
		});
	const presentChirho = resultsChirho.filter(
		(resultChirho) => resultChirho.verdict_chirho === 'present'
	);
	const unverifiedChirho = describeChirho('unverified');
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
		chapters_absent_chirho: describeChirho('absent'),
		chapters_unverified_chirho: unverifiedChirho
	};
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
		`  found ${presentChirho.length} of ${targetsChirho.length}; absent ${describeChirho('absent').length}; unverified ${unverifiedChirho.length}`
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

/** A file's JSON, or an empty object when the file does not exist yet. */
async function readJsonChirho(urlChirho: URL): Promise<Record<string, unknown>> {
	try {
		return JSON.parse(await readFile(urlChirho, 'utf8')) as Record<string, unknown>;
	} catch (errorChirho) {
		if ((errorChirho as { code?: string }).code === 'ENOENT') return {};
		throw errorChirho;
	}
}

/** Replace the checked stations' entries in a per-source file, keeping every other entry. */
async function mergeIntoFileChirho(
	urlChirho: URL,
	sourceIdChirho: string,
	entriesChirho: Record<string, unknown>
): Promise<void> {
	const previousChirho = await readJsonChirho(urlChirho);
	const stationsChirho = {
		...(previousChirho.stations_chirho as Record<string, unknown> | undefined),
		...entriesChirho
	};
	const pathChirho = urlChirho.pathname;
	const optionsChirho = await prettierChirho.resolveConfig(pathChirho);
	const textChirho = await prettierChirho.format(
		JSON.stringify({ source_id_chirho: sourceIdChirho, stations_chirho: stationsChirho }),
		{ ...optionsChirho, filepath: pathChirho }
	);
	await writeFile(urlChirho, textChirho, 'utf8');
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
const draftsChirho = sourceChirho.drafts_chirho.filter(
	(draftChirho) => !onlyStationChirho || draftChirho.id_chirho === onlyStationChirho
);
if (draftsChirho.length === 0)
	failChirho(`no station "${onlyStationChirho}" in source "${sourceIdChirho}"`);

const checkedOnChirho = new Date().toISOString().slice(0, 10);
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

await mergeIntoFileChirho(
	new URL(
		`src/lib/catalogue-chirho/stations-chirho/coverage-chirho/${sourceIdChirho}_coverage_chirho.json`,
		ROOT_CHIRHO
	),
	sourceIdChirho,
	coverageEntriesChirho
);
await mergeIntoFileChirho(
	new URL(
		`spec-chirho/evidence-chirho/catalogue-chirho/${sourceIdChirho}_availability_chirho.json`,
		ROOT_CHIRHO
	),
	sourceIdChirho,
	evidenceEntriesChirho
);

if (incompleteChirho.length > 0) {
	failChirho(
		`Could not finish: ${incompleteChirho.join(', ')}. Their previous coverage was kept. See the evidence file for what went unanswered.`
	);
}
console.log('done');
