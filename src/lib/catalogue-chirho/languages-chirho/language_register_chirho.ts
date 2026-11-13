// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The register of stations that load by language: one line for each, with the notices its
// terms require to be shown. There are hundreds, so it is a list and not a page per station.
// Part of spec-chirho/workflows-chirho/catalogue_workflow_chirho.md.

import type { StationChirho } from '../contract_chirho';

/** The chapters a station plays from several files, as `JOL 2`, in canon order. */
function splitChaptersChirho(stationChirho: StationChirho): string[] {
	return Object.entries(stationChirho.composite_chapters_chirho ?? {}).flatMap(
		([bookIdChirho, chaptersChirho]) =>
			Object.keys(chaptersChirho ?? {})
				.map(Number)
				.sort((aChirho, bChirho) => aChirho - bChirho)
				.map((chapterChirho) => `${bookIdChirho} ${chapterChirho}`)
	);
}

/** One station's line. The credit is the last part, after "Notices:". */
export function registerLineChirho(stationChirho: StationChirho): string {
	const chaptersChirho = stationChirho.chapter_count_chirho.toLocaleString('en-US');
	const splitChirho = splitChaptersChirho(stationChirho);
	const partsChirho =
		splitChirho.length === 0
			? ''
			: ` Also offered from several files, measured ${
					Object.values(stationChirho.composite_chapters_chirho ?? {})
						.flatMap((chaptersChirho) => Object.values(chaptersChirho ?? {}))
						.map((compositeChirho) => compositeChirho.measured_on_chirho)
						.sort()[0]
				}: ${splitChirho.join(', ')}.`;
	return `- \`${stationChirho.id_chirho}\`: ${stationChirho.language_english_chirho} (\`${stationChirho.language_code_chirho}\`), ${stationChirho.version_chirho}, ${chaptersChirho} chapters measured ${stationChirho.coverage_checked_on_chirho}.${partsChirho} Notices: ${stationChirho.credit_chirho}`;
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
	const splitChirho = stationsChirho.reduce(
		(sumChirho, stationChirho) => sumChirho + splitChaptersChirho(stationChirho).length,
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
		...(splitChirho === 0
			? []
			: [
					'',
					`${splitChirho.toLocaleString('en-US')} more chapters are split by their recording across several files and are offered from those files in order, to players that know how. Their parts were measured as far as their length; nobody has listened to them.`
				]),
		'',
		`Terms, read at ${termsAddressChirho}: "${termsChirho}"`,
		'',
		...stationsChirho.map(registerLineChirho),
		''
	].join('\n');
}
