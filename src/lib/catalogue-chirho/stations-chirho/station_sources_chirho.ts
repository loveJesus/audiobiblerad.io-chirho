// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Every source, with its station drafts and its measured coverage. The catalogue builds the
// shipped stations from this list, and the availability check walks the same list, so a
// station cannot be shipped from an address that was not the one checked.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import helloaoCoverageChirho from './coverage-chirho/helloao_coverage_chirho.json';
import openbibleCoverageChirho from './coverage-chirho/openbible_coverage_chirho.json';
import type { CoverageFileChirho } from './coverage_chirho';
import { HELLOAO_SOURCE_ID_CHIRHO, HELLOAO_STATION_DRAFTS_CHIRHO } from './helloao_stations_chirho';
import {
	OPENBIBLE_SOURCE_ID_CHIRHO,
	OPENBIBLE_STATION_DRAFTS_CHIRHO
} from './openbible_stations_chirho';
import type { StationDraftChirho } from './station_builder_chirho';

export interface StationSourceChirho {
	readonly source_id_chirho: string;
	readonly drafts_chirho: readonly StationDraftChirho[];
	readonly coverage_file_chirho: CoverageFileChirho;
}

/** In dial order: the stations of the first source come first. */
export const STATION_SOURCES_CHIRHO: readonly StationSourceChirho[] = [
	{
		source_id_chirho: HELLOAO_SOURCE_ID_CHIRHO,
		drafts_chirho: HELLOAO_STATION_DRAFTS_CHIRHO,
		coverage_file_chirho: helloaoCoverageChirho
	},
	{
		source_id_chirho: OPENBIBLE_SOURCE_ID_CHIRHO,
		drafts_chirho: OPENBIBLE_STATION_DRAFTS_CHIRHO,
		coverage_file_chirho: openbibleCoverageChirho
	}
];
