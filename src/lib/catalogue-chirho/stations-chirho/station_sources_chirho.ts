// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Every source, with its station drafts and its measured coverage. The catalogue builds the
// shipped stations from this list, and the availability check walks the same list, so a
// station cannot be shipped from an address that was not the one checked.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import bielCoverageChirho from './coverage-chirho/biel_coverage_chirho.json' with { type: 'json' };
import ebibleCoverageChirho from './coverage-chirho/ebible_coverage_chirho.json' with { type: 'json' };
import helloaoCoverageChirho from './coverage-chirho/helloao_coverage_chirho.json' with { type: 'json' };
import librivoxCoverageChirho from './coverage-chirho/librivox_coverage_chirho.json' with { type: 'json' };
import openbibleCoverageChirho from './coverage-chirho/openbible_coverage_chirho.json' with { type: 'json' };
import type { CoverageFileChirho } from './coverage_chirho';
import {
	BIEL_SOURCE_ID_CHIRHO,
	BIEL_STATION_DRAFTS_CHIRHO
} from './sources-chirho/biel_stations_chirho';
import {
	EBIBLE_HELD_STATIONS_CHIRHO,
	EBIBLE_SOURCE_ID_CHIRHO
} from './sources-chirho/ebible_stations_chirho';
import {
	HELLOAO_SOURCE_ID_CHIRHO,
	HELLOAO_STATION_DRAFTS_CHIRHO
} from './sources-chirho/helloao_stations_chirho';
import {
	LIBRIVOX_SOURCE_ID_CHIRHO,
	LIBRIVOX_STATION_DRAFTS_CHIRHO
} from './sources-chirho/librivox_stations_chirho';
import {
	OPENBIBLE_SOURCE_ID_CHIRHO,
	OPENBIBLE_STATION_DRAFTS_CHIRHO
} from './sources-chirho/openbible_stations_chirho';
import type { HeldStationChirho, StationDraftChirho } from './station_builder_chirho';

export interface StationSourceChirho {
	readonly source_id_chirho: string;
	/** The stations that play, once measured. */
	readonly drafts_chirho: readonly StationDraftChirho[];
	/** Stations kept back. They are measured like the rest, so releasing one is a one-line move. */
	readonly held_chirho: readonly HeldStationChirho[];
	readonly coverage_file_chirho: CoverageFileChirho;
}

/** In dial order: the stations of the first source come first. */
export const STATION_SOURCES_CHIRHO: readonly StationSourceChirho[] = [
	{
		source_id_chirho: HELLOAO_SOURCE_ID_CHIRHO,
		drafts_chirho: HELLOAO_STATION_DRAFTS_CHIRHO,
		held_chirho: [],
		coverage_file_chirho: helloaoCoverageChirho
	},
	{
		source_id_chirho: OPENBIBLE_SOURCE_ID_CHIRHO,
		drafts_chirho: OPENBIBLE_STATION_DRAFTS_CHIRHO,
		held_chirho: [],
		coverage_file_chirho: openbibleCoverageChirho
	},
	{
		source_id_chirho: EBIBLE_SOURCE_ID_CHIRHO,
		drafts_chirho: [],
		held_chirho: EBIBLE_HELD_STATIONS_CHIRHO,
		coverage_file_chirho: ebibleCoverageChirho
	},
	{
		source_id_chirho: BIEL_SOURCE_ID_CHIRHO,
		drafts_chirho: BIEL_STATION_DRAFTS_CHIRHO,
		held_chirho: [],
		coverage_file_chirho: bielCoverageChirho
	},
	{
		source_id_chirho: LIBRIVOX_SOURCE_ID_CHIRHO,
		drafts_chirho: LIBRIVOX_STATION_DRAFTS_CHIRHO,
		held_chirho: [],
		coverage_file_chirho: librivoxCoverageChirho
	}
];

/** Every draft of a source, playing or held: what the availability check measures. */
export function allDraftsOfChirho(
	sourceChirho: StationSourceChirho
): readonly StationDraftChirho[] {
	return [
		...sourceChirho.drafts_chirho,
		...sourceChirho.held_chirho.map((heldChirho) => heldChirho.draft_chirho)
	];
}
