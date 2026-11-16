// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { mkdirSync as mkdirChirho } from 'node:fs';
import { CATALOGUE_CHIRHO } from '../../src/lib/catalogue-chirho/catalogue_chirho';

// Native builds share one generated metadata snapshot; they never bundle Scripture recordings.
// See workflows-chirho/experience-chirho/native_players_workflow_chirho.md.
const outputChirho = new URL(
	'../../apps-chirho/shared-chirho/catalogue_chirho.json',
	import.meta.url
);
const expectedChirho = `${JSON.stringify(CATALOGUE_CHIRHO)}\n`;
const fileChirho = Bun.file(outputChirho);
if (process.argv.includes('--check-chirho')) {
	if (!(await fileChirho.exists()) || (await fileChirho.text()) !== expectedChirho)
		throw new Error('Native catalogue metadata is stale; run the native catalogue exporter.');
	console.log('Native catalogue metadata matches the web contract.');
} else {
	mkdirChirho(new URL('../../apps-chirho/shared-chirho/', import.meta.url), { recursive: true });
	await Bun.write(outputChirho, expectedChirho);
	console.log(`Native catalogue metadata: ${CATALOGUE_CHIRHO.stations_chirho.length} stations.`);
}
