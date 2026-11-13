// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The register of stations that load by language: one line for each, with the notices its
// terms require to be shown. There are hundreds, so it is a list and not a page per station.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { StationChirho } from '../contract_chirho';

/** One station's line. The credit is the last part, after "Notices:". */
export function registerLineChirho(stationChirho: StationChirho): string {
	const chaptersChirho = stationChirho.chapter_count_chirho.toLocaleString('en-US');
	return `- \`${stationChirho.id_chirho}\`: ${stationChirho.language_english_chirho} (\`${stationChirho.language_code_chirho}\`), ${stationChirho.version_chirho}, ${chaptersChirho} chapters measured ${stationChirho.coverage_checked_on_chirho}. Notices: ${stationChirho.credit_chirho}`;
}

/** The whole page, as Markdown, ending in a newline. Stations in the order given. */
export function renderLanguageRegisterChirho(
	sourceNameChirho: string,
	termsChirho: string,
	termsAddressChirho: string,
	stationsChirho: readonly StationChirho[]
): string {
	const languagesChirho = new Set(
		stationsChirho.map((stationChirho) => stationChirho.language_code_chirho)
	);
	const chaptersChirho = stationsChirho.reduce(
		(sumChirho, stationChirho) => sumChirho + stationChirho.chapter_count_chirho,
		0
	);
	return [
		'<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->',
		'',
		`# Station register: ${sourceNameChirho}`,
		'',
		'Written by a script from the language files the radio serves. Do not edit it by hand: a test',
		'fails when a station is served that is not listed here with its notices.',
		'',
		`${stationsChirho.length.toLocaleString('en-US')} stations in ${languagesChirho.size.toLocaleString('en-US')} languages, ${chaptersChirho.toLocaleString('en-US')} chapters. They load by language, on demand.`,
		'',
		`Terms, read at ${termsAddressChirho}: "${termsChirho}"`,
		'',
		...stationsChirho.map(registerLineChirho),
		''
	].join('\n');
}
