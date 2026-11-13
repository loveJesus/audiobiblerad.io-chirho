// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Turns a reading of Davar Audio Bibles' library into the files the radio serves by language.
//
//   bun scripts-chirho/catalogue-chirho/build_davar_languages_chirho.ts <reading.json> [<first-files.json>]
//
// The reading is made in a real browser, because the library's host refuses clients that are
// not browsers: its index (https://audio.dbs.org/index.json) and each recording's own file
// list (https://audio.dbs.org/<id>/index.txt), saved as
//   { started_chirho, finished_chirho, index_chirho: [...], lists_chirho: { <id>: [file names] } }
// The optional second file records the first listed file of every recording loaded in an audio
// element: { results_chirho: { <id>: { kind: 'loaded' | 'error' | 'timeout' } } }.
// Neither file is kept in the repository; their size and hash are recorded in the evidence.
//
// Writes:
//   static/catalogue-chirho/languages_chirho.json
//   static/catalogue-chirho/languages-chirho/<first letter>/<code>.json
//   spec-chirho/sources-chirho/davar_station_register_chirho.md
//   spec-chirho/evidence-chirho/catalogue-chirho/davar_snapshot_chirho.json
//
// A chapter is claimed only when the recording's own list names a file for it; the rule is in
// davar_stations_chirho.ts. Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { BOOKS_CHIRHO } from '../../src/lib/catalogue-chirho/books-chirho/books_chirho';
import {
	CATALOGUE_CONTRACT_VERSION_CHIRHO,
	type StationChirho
} from '../../src/lib/catalogue-chirho/contract_chirho';
import {
	languageFilePathChirho,
	type LanguageEntryChirho
} from '../../src/lib/catalogue-chirho/languages-chirho/language_loader_chirho';
import { renderLanguageRegisterChirho } from '../../src/lib/catalogue-chirho/languages-chirho/language_register_chirho';
import { readStationChirho } from '../../src/lib/catalogue-chirho/languages-chirho/station_reader_chirho';
import { resolveChapterChirho } from '../../src/lib/catalogue-chirho/locate-chirho/locate_chirho';
import {
	DAVAR_SOURCE_NAME_CHIRHO,
	DAVAR_TERMS_ADDRESS_CHIRHO,
	DAVAR_TERMS_CHIRHO,
	buildDavarStationChirho,
	type DavarLanguageChirho,
	type DavarNotesChirho
} from '../../src/lib/catalogue-chirho/stations-chirho/sources-chirho/davar_stations_chirho';
import {
	DAVAR_HEBREW_JOEL_APPROVED_CHIRHO,
	DAVAR_JOEL_LEFT_AS_IS_CHIRHO
} from '../../src/lib/catalogue-chirho/stations-chirho/sources-chirho/davar_numbering_chirho';
import { ROOT_CHIRHO, catalogueFileChirho, failChirho, writeJsonChirho } from './files_chirho';

const ALL_CHAPTERS_CHIRHO = BOOKS_CHIRHO.reduce(
	(sumChirho, bookChirho) => sumChirho + bookChirho.chapters_chirho,
	0
);
/** How many unmatched file names are written out per recording; the rest are counted. */
const UNMATCHED_SHOWN_CHIRHO = 6;

/**
 * Codes the library gives for one member of a language family, where the standard tag is the
 * family's two-letter code (the Unicode locale data's language aliases). Without this, Swahili
 * from this library (`swh`) and Swahili already in the catalogue (`sw`) would look like two
 * languages. Only codes found in the library are listed.
 */
const STANDARD_TAGS_CHIRHO: Readonly<Record<string, string>> = {
	swh: 'sw',
	pes: 'fa',
	npi: 'ne',
	ory: 'or',
	khk: 'mn',
	pbu: 'ps',
	quz: 'qu',
	azj: 'az',
	plt: 'mg',
	gaz: 'om',
	kng: 'kg'
};

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

async function readWithHashChirho(
	pathChirho: string
): Promise<{ valueChirho: unknown; bytesChirho: number; sha256Chirho: string }> {
	const bytesChirho = await readFile(pathChirho);
	return {
		valueChirho: JSON.parse(bytesChirho.toString('utf8')) as unknown,
		bytesChirho: bytesChirho.length,
		sha256Chirho: createHash('sha256').update(bytesChirho).digest('hex')
	};
}

/**
 * The language of an index entry. The library gives a three-letter code; the tag used here is
 * the shortest standard one for it (`hi` for `hin`). Its own name is taken where it is known
 * and is otherwise the name the library gives in English.
 */
function languageOfChirho(
	isoChirho: unknown,
	libraryNameChirho: unknown
): DavarLanguageChirho | null {
	if (typeof isoChirho !== 'string' || typeof libraryNameChirho !== 'string') return null;
	let codeChirho: string;
	const givenChirho = isoChirho.trim().toLowerCase();
	try {
		codeChirho =
			Intl.getCanonicalLocales(
				STANDARD_TAGS_CHIRHO[givenChirho] ?? givenChirho
			)[0]?.toLowerCase() ?? '';
	} catch {
		return null;
	}
	if (languageFilePathChirho(codeChirho) === null) return null;
	const knownChirho = (localeChirho: string): string | null => {
		try {
			const nameChirho = new Intl.DisplayNames([localeChirho], {
				type: 'language',
				fallback: 'none'
			}).of(codeChirho);
			return nameChirho && nameChirho.toLowerCase() !== codeChirho ? nameChirho : null;
		} catch {
			return null;
		}
	};
	const englishChirho = knownChirho('en') ?? libraryNameChirho.trim();
	return {
		code_chirho: codeChirho,
		name_chirho: knownChirho(codeChirho) ?? englishChirho,
		english_chirho: englishChirho
	};
}

const [readingPathChirho, firstFilesPathChirho, partLengthsPathChirho] = process.argv.slice(2);
if (!readingPathChirho) {
	failChirho(
		'usage: build_davar_languages_chirho.ts <reading.json> [<first-files.json> [<part-lengths.json>]]'
	);
}

// The measured lengths of files that are parts of a chapter, keyed `recording/file name`.
// Without them no split chapter is offered, and the stations are exactly as before.
const partLengthsChirho = partLengthsPathChirho
	? await readWithHashChirho(partLengthsPathChirho)
	: null;
const lengthsByRecordingChirho = new Map<string, Map<string, number>>();
let measuredOnChirho = '';
if (partLengthsChirho) {
	const { measured_on_chirho: dayChirho, seconds_chirho: secondsChirho } = isRecordChirho(
		partLengthsChirho.valueChirho
	)
		? partLengthsChirho.valueChirho
		: {};
	if (typeof dayChirho !== 'string' || !isRecordChirho(secondsChirho)) {
		failChirho('the part lengths have no measuring day or no lengths');
	}
	measuredOnChirho = dayChirho;
	for (const [keyChirho, valueChirho] of Object.entries(secondsChirho)) {
		const slashChirho = keyChirho.indexOf('/');
		if (slashChirho < 1 || typeof valueChirho !== 'number' || !Number.isFinite(valueChirho)) {
			failChirho(`a part length is not readable: ${keyChirho}`);
		}
		const recordingChirho = keyChirho.slice(0, slashChirho);
		if (!lengthsByRecordingChirho.has(recordingChirho)) {
			lengthsByRecordingChirho.set(recordingChirho, new Map());
		}
		lengthsByRecordingChirho
			.get(recordingChirho)!
			.set(keyChirho.slice(slashChirho + 1), valueChirho);
	}
}
const readingChirho = await readWithHashChirho(readingPathChirho);
if (!isRecordChirho(readingChirho.valueChirho)) failChirho('the reading is not an object');
const {
	index_chirho: indexChirho,
	lists_chirho: listsChirho,
	finished_chirho: finishedChirho
} = readingChirho.valueChirho;
if (
	!Array.isArray(indexChirho) ||
	!isRecordChirho(listsChirho) ||
	typeof finishedChirho !== 'string'
) {
	failChirho('the reading has no index, no lists or no finish time');
}
const readOnChirho = finishedChirho.slice(0, 10);

const stationsByLanguageChirho = new Map<
	string,
	{ languageChirho: DavarLanguageChirho; stationsChirho: StationChirho[] }
>();
const notesChirho: DavarNotesChirho[] = [];
const refusedChirho: string[] = [];
const usedLengthsChirho = new Set<string>();
const seenIdsChirho = new Set<string>();
let addressesCheckedChirho = 0;
for (const entryChirho of indexChirho as unknown[]) {
	const recordChirho = isRecordChirho(entryChirho) ? entryChirho : {};
	const recordingChirho = String(recordChirho.id ?? '');
	const languageChirho = languageOfChirho(recordChirho.iso, recordChirho.ln);
	const namesChirho = listsChirho[recordingChirho];
	if (!languageChirho || !Array.isArray(namesChirho)) {
		refusedChirho.push(
			`${recordingChirho || '(no id)'}: ${languageChirho ? 'no file list was read' : 'its language code is not usable'}`
		);
		continue;
	}
	const builtChirho = buildDavarStationChirho(
		entryChirho,
		namesChirho as unknown[],
		languageChirho,
		readOnChirho,
		DAVAR_HEBREW_JOEL_APPROVED_CHIRHO,
		lengthsByRecordingChirho.has(recordingChirho)
			? {
					measured_on_chirho: measuredOnChirho,
					seconds_chirho: lengthsByRecordingChirho.get(recordingChirho)!
				}
			: undefined
	);
	notesChirho.push(builtChirho.notes_chirho);
	// Whatever is written must be exactly what the radio will accept when it reads it back.
	const stationChirho = builtChirho.station_chirho
		? readStationChirho(builtChirho.station_chirho)
		: null;
	if (!stationChirho) {
		refusedChirho.push(
			`${recordingChirho}: ${builtChirho.notes_chirho.refused_chirho ?? 'the station it makes is not well formed'}`
		);
		continue;
	}
	// Every address the station can give must be a file its own list names, letter for letter.
	const listedChirho = new Set(
		(namesChirho as unknown[]).map(
			(nameChirho) =>
				`https://audio.dbs.org/${encodeURIComponent(recordingChirho)}/${encodeURIComponent(String(nameChirho))}`
		)
	);
	let strayChirho = '';
	for (const bookChirho of BOOKS_CHIRHO) {
		for (const [firstChirho, lastChirho] of stationChirho.coverage_chirho[bookChirho.id_chirho] ??
			[]) {
			for (let chapterChirho = firstChirho; chapterChirho <= lastChirho; chapterChirho += 1) {
				const addressChirho = resolveChapterChirho(
					stationChirho,
					bookChirho.id_chirho,
					chapterChirho
				)?.url_chirho;
				if (!addressChirho || !listedChirho.has(addressChirho)) {
					strayChirho ||= `${bookChirho.id_chirho} ${chapterChirho} resolves to ${String(addressChirho)}, which its list does not name`;
				}
			}
		}
	}
	// The parts of a split chapter too, and each part must be a file that was measured.
	const measuredHereChirho = lengthsByRecordingChirho.get(recordingChirho);
	for (const [bookIdChirho, chaptersChirho] of Object.entries(
		stationChirho.composite_chapters_chirho ?? {}
	)) {
		for (const [chapterTextChirho, compositeChirho] of Object.entries(chaptersChirho ?? {})) {
			for (const partChirho of compositeChirho.parts_chirho) {
				const nameChirho = decodeURIComponent(partChirho.url_chirho.split('/').pop() ?? '');
				if (
					!listedChirho.has(partChirho.url_chirho) ||
					measuredHereChirho?.get(nameChirho) !== partChirho.duration_seconds_chirho
				) {
					strayChirho ||= `a part of ${bookIdChirho} ${chapterTextChirho}, ${partChirho.url_chirho}, is not a listed and measured file`;
				}
				usedLengthsChirho.add(`${recordingChirho}/${nameChirho}`);
			}
		}
	}
	if (strayChirho) {
		refusedChirho.push(`${recordingChirho}: ${strayChirho}`);
		continue;
	}
	addressesCheckedChirho += stationChirho.chapter_count_chirho;
	if (seenIdsChirho.has(stationChirho.id_chirho)) {
		refusedChirho.push(`${recordingChirho}: its station id is already taken`);
		continue;
	}
	seenIdsChirho.add(stationChirho.id_chirho);
	if (!stationsByLanguageChirho.has(languageChirho.code_chirho)) {
		stationsByLanguageChirho.set(languageChirho.code_chirho, {
			languageChirho,
			stationsChirho: []
		});
	}
	stationsByLanguageChirho.get(languageChirho.code_chirho)!.stationsChirho.push(stationChirho);
}

// The Hebrew reading of Joel is applied only to recordings approved by name. A reading of the
// library that no longer agrees with those lists stops here, before anything is written, so a
// person decides each new or changed recording.
function sameSetChirho(
	actualChirho: readonly string[],
	expectedChirho: ReadonlySet<string>
): boolean {
	return (
		actualChirho.length === expectedChirho.size &&
		actualChirho.every((idChirho) => expectedChirho.has(idChirho))
	);
}
// Every measured length must become a part of exactly one offered chapter, and no split
// chapter may be turned away, or the lengths and the library no longer agree.
if (partLengthsChirho) {
	const measuredKeysChirho = [...lengthsByRecordingChirho].flatMap(
		([recordingChirho, namesChirho]) =>
			[...namesChirho.keys()].map((nameChirho) => `${recordingChirho}/${nameChirho}`)
	);
	const unusedChirho = measuredKeysChirho.filter((keyChirho) => !usedLengthsChirho.has(keyChirho));
	if (unusedChirho.length > 0) {
		failChirho(`measured files that no offered chapter uses: ${unusedChirho.join(', ')}`);
	}
	const turnedAwayChirho = notesChirho.flatMap((noteChirho) =>
		noteChirho.composite_refused_chirho.map(
			(whyChirho) => `${noteChirho.recording_chirho} ${whyChirho}`
		)
	);
	if (turnedAwayChirho.length > 0) {
		failChirho(`split chapters not offered: ${turnedAwayChirho.join('; ')}`);
	}
}
const numberedChirho = (kindChirho: DavarNotesChirho['numbering_chirho']) =>
	notesChirho
		.filter((noteChirho) => noteChirho.numbering_chirho === kindChirho)
		.map((noteChirho) => noteChirho.recording_chirho);
if (!sameSetChirho(numberedChirho('hebrew_inferred'), DAVAR_HEBREW_JOEL_APPROVED_CHIRHO)) {
	failChirho(
		`the recordings read as Hebrew-numbered are not the approved list: ${numberedChirho('hebrew_inferred').join(', ')}`
	);
}
if (!sameSetChirho(numberedChirho('unresolved'), DAVAR_JOEL_LEFT_AS_IS_CHIRHO)) {
	failChirho(
		`the recordings with a Joel 4 left as it is are not the known two: ${numberedChirho('unresolved').join(', ')}`
	);
}

const languagesChirho = [...stationsByLanguageChirho.values()].sort((aChirho, bChirho) =>
	aChirho.languageChirho.english_chirho.localeCompare(bChirho.languageChirho.english_chirho, 'en')
);
const entriesChirho: LanguageEntryChirho[] = languagesChirho.map(
	({ languageChirho, stationsChirho }) => ({
		...languageChirho,
		station_count_chirho: stationsChirho.length,
		has_whole_bible_chirho: stationsChirho.some(
			(stationChirho) => stationChirho.chapter_count_chirho === ALL_CHAPTERS_CHIRHO
		)
	})
);

// The language files belong to this script: clear them, so that a language that has gone
// from the library does not linger.
const languagesFolderChirho = new URL('static/catalogue-chirho/languages-chirho/', ROOT_CHIRHO);
await rm(languagesFolderChirho, { recursive: true, force: true });
for (const { languageChirho, stationsChirho } of languagesChirho) {
	const fileChirho = new URL(
		`static/${languageFilePathChirho(languageChirho.code_chirho)}`,
		ROOT_CHIRHO
	);
	await mkdir(new URL('./', fileChirho), { recursive: true });
	await writeJsonChirho(fileChirho, {
		contract_version_chirho: CATALOGUE_CONTRACT_VERSION_CHIRHO,
		language_chirho: languageChirho,
		stations_chirho: stationsChirho
	});
}
// One language to a line: the list is long, and a line each keeps it readable and small.
await writeFile(
	new URL('static/catalogue-chirho/languages_chirho.json', ROOT_CHIRHO),
	[
		`{"contract_version_chirho":${CATALOGUE_CONTRACT_VERSION_CHIRHO},"read_on_chirho":${JSON.stringify(readOnChirho)},"languages_chirho":[`,
		entriesChirho.map((entryChirho) => JSON.stringify(entryChirho)).join(',\n'),
		']}',
		''
	].join('\n'),
	'utf8'
);

const allStationsChirho = languagesChirho.flatMap(({ stationsChirho }) => stationsChirho);
await writeFile(
	new URL('spec-chirho/sources-chirho/davar_station_register_chirho.md', ROOT_CHIRHO),
	renderLanguageRegisterChirho(
		DAVAR_SOURCE_NAME_CHIRHO,
		DAVAR_TERMS_CHIRHO,
		DAVAR_TERMS_ADDRESS_CHIRHO,
		allStationsChirho
	),
	'utf8'
);

let firstFilesChirho: Record<string, unknown> = { loaded_chirho: 'not recorded with this build' };
if (firstFilesPathChirho) {
	const probeChirho = await readWithHashChirho(firstFilesPathChirho);
	const resultsChirho =
		isRecordChirho(probeChirho.valueChirho) &&
		isRecordChirho(probeChirho.valueChirho.results_chirho)
			? probeChirho.valueChirho.results_chirho
			: {};
	const kindsChirho = Object.values(resultsChirho).map((resultChirho) =>
		isRecordChirho(resultChirho) ? String(resultChirho.kind) : 'unreadable'
	);
	firstFilesChirho = {
		what_chirho:
			'the first listed file of every recording, loaded as far as its metadata in an audio element on another website',
		recordings_chirho: kindsChirho.length,
		loaded_chirho: kindsChirho.filter((kindChirho) => kindChirho === 'loaded').length,
		not_loaded_chirho: Object.entries(resultsChirho)
			.filter(([, resultChirho]) => !isRecordChirho(resultChirho) || resultChirho.kind !== 'loaded')
			.map(([idChirho]) => idChirho),
		file_bytes_chirho: probeChirho.bytesChirho,
		file_sha256_chirho: probeChirho.sha256Chirho
	};
}
const withAnythingToSayChirho = notesChirho.filter(
	(noteChirho) =>
		noteChirho.unmatched_chirho.length > 0 ||
		noteChirho.duplicates_chirho > 0 ||
		noteChirho.numbering_chirho !== 'standard' ||
		noteChirho.overrides_chirho > 0 ||
		noteChirho.refused_chirho
);
await writeJsonChirho(catalogueFileChirho('evidence', 'davar_snapshot_chirho.json'), {
	source_id_chirho: 'davar',
	read_on_chirho: readOnChirho,
	how_chirho:
		"the library's index and each recording's own file list, read in a real browser; a chapter is claimed only when a listed file names it. The chapters were not each opened: only the first listed file of every recording was",
	reading_chirho: {
		started_chirho: readingChirho.valueChirho.started_chirho,
		finished_chirho: finishedChirho,
		file_bytes_chirho: readingChirho.bytesChirho,
		file_sha256_chirho: readingChirho.sha256Chirho
	},
	recordings_in_index_chirho: (indexChirho as unknown[]).length,
	files_listed_chirho: notesChirho.reduce(
		(sumChirho, noteChirho) => sumChirho + noteChirho.files_chirho,
		0
	),
	stations_chirho: allStationsChirho.length,
	languages_chirho: languagesChirho.length,
	chapters_chirho: allStationsChirho.reduce(
		(sumChirho, stationChirho) => sumChirho + stationChirho.chapter_count_chirho,
		0
	),
	addresses_checked_against_the_lists_chirho: addressesCheckedChirho,
	stations_with_every_chapter_chirho: allStationsChirho.filter(
		(stationChirho) => stationChirho.chapter_count_chirho === ALL_CHAPTERS_CHIRHO
	).length,
	files_naming_no_chapter_chirho: notesChirho.reduce(
		(sumChirho, noteChirho) => sumChirho + noteChirho.unmatched_chirho.length,
		0
	),
	files_held_back_as_part_of_a_chapter_chirho: notesChirho.reduce(
		(sumChirho, noteChirho) => sumChirho + noteChirho.withheld_chirho.length,
		0
	),
	files_for_a_chapter_already_filled_chirho: notesChirho.reduce(
		(sumChirho, noteChirho) => sumChirho + noteChirho.duplicates_chirho,
		0
	),
	chapters_reached_by_override_chirho: notesChirho.reduce(
		(sumChirho, noteChirho) => sumChirho + noteChirho.overrides_chirho,
		0
	),
	recordings_refused_chirho: refusedChirho,
	first_files_chirho: firstFilesChirho,
	chapters_played_from_parts_chirho: {
		what_chirho:
			'Chapters a recording splits across files, offered as their files played in order: Joel 2 of the recordings that count Joel in four (their second file, then their third), and psalms split into lettered halves. They are kept apart from the coverage, so a player that does not know them never offers them.',
		how_measured_chirho:
			'Each part was loaded once in a browser as far as its metadata to learn its length; see davar_parts_batch_a_chirho.json and davar_parts_batch_b_chirho.json. A length shows the file could be read, not that the sound is complete or holds the verses its name suggests.',
		part_lengths_chirho: partLengthsChirho
			? {
					file_bytes_chirho: partLengthsChirho.bytesChirho,
					file_sha256_chirho: partLengthsChirho.sha256Chirho,
					measured_on_chirho: measuredOnChirho
				}
			: null,
		chapters_chirho: notesChirho.reduce(
			(sumChirho, noteChirho) => sumChirho + noteChirho.composite_chirho.length,
			0
		),
		files_chirho: usedLengthsChirho.size,
		by_recording_chirho: notesChirho
			.filter((noteChirho) => noteChirho.composite_chirho.length > 0)
			.map((noteChirho) => ({
				recording_chirho: noteChirho.recording_chirho,
				chapters_chirho: noteChirho.composite_chirho
			}))
	},
	joel_and_malachi_numbering_chirho: {
		what_chirho:
			'Hebrew Bibles, and translations that follow them, count Joel in four chapters and Malachi in three: Joel 2:28-32 is their chapter 3, Joel 3 is their chapter 4, and Malachi 4 is the end of their chapter 3.',
		how_judged_chirho:
			'From file names alone: a recording that lists a Joel 4 and a Malachi 3 and no Malachi 4 is taken to number them so, and only when it is also on the list approved by name in src/lib/catalogue-chirho/stations-chirho/sources-chirho/davar_numbering_chirho.ts. Nobody has listened, and the maker has not confirmed it. The crosswalk is from the SBL Handbook of Style, appendix E, and SIL eng.vrs; they support the crosswalk, not the reading of any one recording.',
		what_was_done_chirho:
			'On those recordings Joel 3 is their fourth file. Their second and third files of Joel are each a part of chapter 2 and are held back, so Joel 2 is not offered. Malachi 3 plays their third file, which is wider than Malachi 3 elsewhere: it also holds what other stations call Malachi 4 (Hebrew Malachi 3:19-24). Malachi 4 is not offered separately on those stations.',
		taken_as_hebrew_chirho: notesChirho
			.filter((noteChirho) => noteChirho.numbering_chirho === 'hebrew_inferred')
			.map((noteChirho) => ({
				recording_chirho: noteChirho.recording_chirho,
				withheld_chirho: noteChirho.withheld_chirho
			})),
		lists_a_joel_4_but_left_as_it_is_chirho: notesChirho
			.filter((noteChirho) => noteChirho.numbering_chirho === 'unresolved')
			.map((noteChirho) => noteChirho.recording_chirho)
	},
	recordings_with_something_to_note_chirho: withAnythingToSayChirho.map((noteChirho) => ({
		recording_chirho: noteChirho.recording_chirho,
		files_chirho: noteChirho.files_chirho,
		chapters_chirho: noteChirho.chapters_chirho,
		overrides_chirho: noteChirho.overrides_chirho,
		duplicates_chirho: noteChirho.duplicates_chirho,
		numbering_chirho: noteChirho.numbering_chirho,
		withheld_chirho: noteChirho.withheld_chirho.length,
		played_from_parts_chirho: noteChirho.composite_chirho,
		unmatched_chirho: noteChirho.unmatched_chirho.length,
		unmatched_examples_chirho: noteChirho.unmatched_chirho.slice(0, UNMATCHED_SHOWN_CHIRHO)
	}))
});

console.log(
	`${allStationsChirho.length} stations in ${languagesChirho.length} languages, ${allStationsChirho.reduce((sumChirho, stationChirho) => sumChirho + stationChirho.chapter_count_chirho, 0)} chapters; ${refusedChirho.length} recordings refused`
);
for (const lineChirho of refusedChirho) console.log(`  refused ${lineChirho}`);
