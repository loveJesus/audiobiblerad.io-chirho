// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The station register: for every station that plays, its licence, the credit listeners are
// shown, and the page the licence was read on; and for every station held back, the reason.
// It is written out as a page a person can read. The project's rule is that a station ships
// only when those are on record. The page is written from the catalogue, and a test fails when
// the two differ, so the record cannot fall behind what ships.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { BOOKS_CHIRHO } from '../books-chirho/books_chirho';
import type { StationChirho } from '../contract_chirho';
import type { HeldStationRecordChirho } from './held_stations_chirho';

const ALL_CHAPTERS_CHIRHO = BOOKS_CHIRHO.reduce(
	(sumChirho, bookChirho) => sumChirho + bookChirho.chapters_chirho,
	0
);

const VOICE_KIND_WORDS_CHIRHO = {
	human: 'human',
	synthetic: 'synthetic',
	unknown: 'kind not stated by the maker'
} as const;

function countChirho(numberChirho: number): string {
	return numberChirho.toLocaleString('en-US');
}

function languageHeadingChirho(stationChirho: StationChirho): string {
	return stationChirho.language_name_chirho === stationChirho.language_english_chirho
		? stationChirho.language_english_chirho
		: `${stationChirho.language_english_chirho} (${stationChirho.language_name_chirho})`;
}

function factLinesChirho(stationChirho: StationChirho): string[] {
	const voiceChirho = stationChirho.voice_chirho || 'not named by the maker';
	return [
		`- Version: ${stationChirho.version_chirho} (${stationChirho.version_code_chirho})`,
		`- Voice: ${voiceChirho} (${VOICE_KIND_WORDS_CHIRHO[stationChirho.voice_kind_chirho]})`,
		`- Source: ${stationChirho.source_name_chirho}, ${stationChirho.source_url_chirho}`,
		`- Chapters: ${countChirho(stationChirho.chapter_count_chirho)} of ${countChirho(ALL_CHAPTERS_CHIRHO)}, measured ${stationChirho.coverage_checked_on_chirho}`,
		`- Verse timings: ${stationChirho.has_timings_chirho ? 'yes' : 'no'}`,
		`- Licence: ${stationChirho.licence_name_chirho} (${stationChirho.licence_id_chirho}), ${stationChirho.licence_url_chirho}`,
		`- Licence read at: ${stationChirho.licence_evidence_url_chirho} on ${stationChirho.licence_read_on_chirho}`
	];
}

/** The whole register page, as Markdown, ending in a newline. */
export function renderStationRegisterChirho(
	stationsChirho: readonly StationChirho[],
	heldChirho: readonly HeldStationRecordChirho[] = []
): string {
	// Languages in the order the catalogue first meets them, each with its stations in order.
	const byLanguageChirho = new Map<string, StationChirho[]>();
	for (const stationChirho of stationsChirho) {
		const headingChirho = languageHeadingChirho(stationChirho);
		byLanguageChirho.set(headingChirho, [
			...(byLanguageChirho.get(headingChirho) ?? []),
			stationChirho
		]);
	}

	const playingChirho = `${countChirho(stationsChirho.length)} ${stationsChirho.length === 1 ? 'station plays' : 'stations play'}, in ${countChirho(byLanguageChirho.size)} ${byLanguageChirho.size === 1 ? 'language' : 'languages'}.`;
	const waitingChirho =
		heldChirho.length === 0
			? ''
			: ` ${countChirho(heldChirho.length)} more ${heldChirho.length === 1 ? 'is' : 'are'} held back, at the end.`;
	const linesChirho = [
		'<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->',
		'',
		'# Station register',
		'',
		'Written by `bun scripts-chirho/catalogue-chirho/write_station_register_chirho.ts` from the catalogue',
		'itself. Do not edit it by hand: a test fails when this page differs from what ships.',
		'',
		'Every station that plays is listed here with its licence, the credit shown to listeners, and the',
		'page the licence was read on. The words that grant each licence are quoted in the sources file',
		'beside this one.',
		'',
		`${playingChirho}${waitingChirho}`,
		''
	];
	for (const [headingChirho, languageStationsChirho] of byLanguageChirho) {
		linesChirho.push(`## ${headingChirho}`, '');
		for (const stationChirho of languageStationsChirho) {
			linesChirho.push(
				`### ${stationChirho.id_chirho}`,
				'',
				...factLinesChirho(stationChirho),
				`- Credit shown: ${stationChirho.credit_chirho}`,
				''
			);
		}
	}
	if (heldChirho.length > 0) {
		linesChirho.push(
			'## Held back',
			'',
			'Defined and measured, but not playing. No player is given these.',
			''
		);
		for (const { station_chirho: stationChirho, reason_chirho: reasonChirho } of heldChirho) {
			linesChirho.push(
				`### ${stationChirho.id_chirho}`,
				'',
				`- Language: ${languageHeadingChirho(stationChirho)}`,
				...factLinesChirho(stationChirho),
				`- Held because: ${reasonChirho}`,
				''
			);
		}
	}
	return `${linesChirho.join('\n').trimEnd()}\n`;
}
