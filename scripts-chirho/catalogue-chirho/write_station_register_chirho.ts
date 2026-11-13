// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Writes the station register page from the catalogue. Run it after any change to the
// stations or their coverage; a test fails until the page matches what ships.
//
//   bun scripts-chirho/catalogue-chirho/write_station_register_chirho.ts
//
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import { writeFile } from 'node:fs/promises';
import { STATIONS_CHIRHO } from '../../src/lib/catalogue-chirho/catalogue_chirho';
import { HELD_STATIONS_CHIRHO } from '../../src/lib/catalogue-chirho/stations-chirho/held_stations_chirho';
import { renderStationRegisterChirho } from '../../src/lib/catalogue-chirho/stations-chirho/register_chirho';
import { ROOT_CHIRHO } from './files_chirho';

const REGISTER_URL_CHIRHO = new URL(
	'spec-chirho/sources-chirho/station_register_chirho.md',
	ROOT_CHIRHO
);

await writeFile(
	REGISTER_URL_CHIRHO,
	renderStationRegisterChirho(STATIONS_CHIRHO, HELD_STATIONS_CHIRHO),
	'utf8'
);
console.log(
	`wrote ${STATIONS_CHIRHO.length} playing and ${HELD_STATIONS_CHIRHO.length} held stations to ${REGISTER_URL_CHIRHO.pathname}`
);
