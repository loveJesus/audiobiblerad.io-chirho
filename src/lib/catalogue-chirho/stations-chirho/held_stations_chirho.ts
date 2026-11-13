// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations that are defined and measured but do not play, each with what must happen first.
// They are kept out of the catalogue's public surface on purpose: no player should see them.
// The station register lists them, so the record of what is held cannot drift either.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { StationChirho } from '../contract_chirho';
import { buildStationChirho } from './station_builder_chirho';
import { STATION_SOURCES_CHIRHO } from './station_sources_chirho';

export interface HeldStationRecordChirho {
	readonly station_chirho: StationChirho;
	/** What must happen before it may play, in a sentence a stranger can act on. */
	readonly reason_chirho: string;
}

export const HELD_STATIONS_CHIRHO: readonly HeldStationRecordChirho[] =
	STATION_SOURCES_CHIRHO.flatMap((sourceChirho) =>
		sourceChirho.held_chirho.map((heldChirho) => ({
			station_chirho: buildStationChirho(
				heldChirho.draft_chirho,
				sourceChirho.coverage_file_chirho
			),
			reason_chirho: heldChirho.reason_chirho
		}))
	);
