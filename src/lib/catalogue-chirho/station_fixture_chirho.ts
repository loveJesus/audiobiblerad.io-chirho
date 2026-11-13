// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// A made-up station for tests, so that the behaviour of the catalogue can be proved without
// depending on what any real source happens to have today. Nothing that ships imports this.

import type { CoverageChirho, StationChirho } from './contract_chirho';
import { countChaptersChirho } from './stations-chirho/coverage_chirho';

export function makeStationFixtureChirho(
	coverageChirho: CoverageChirho,
	changesChirho: Partial<StationChirho> = {}
): StationChirho {
	const stationChirho: StationChirho = {
		id_chirho: 'fixture-station',
		source_id_chirho: 'fixture',
		language_code_chirho: 'en',
		language_name_chirho: 'English',
		language_english_chirho: 'English',
		version_chirho: 'Fixture Version',
		version_code_chirho: 'FXV',
		voice_chirho: '',
		voice_kind_chirho: 'unknown',
		source_name_chirho: 'Fixture Source',
		source_url_chirho: 'https://source.example/',
		licence_id_chirho: 'CC0-1.0',
		licence_name_chirho: 'CC0 1.0 Universal',
		licence_url_chirho: 'https://licence.example/',
		credit_chirho: 'A fixture.',
		licence_evidence_url_chirho: 'https://source.example/licence',
		licence_read_on_chirho: '2026-11-13',
		locator_chirho: {
			kind_chirho: 'pattern',
			template_chirho: 'https://audio.example/{book_upper_chirho}/{chapter_chirho}.mp3'
		},
		has_timings_chirho: false,
		coverage_chirho: coverageChirho,
		coverage_checked_on_chirho: '2026-11-13',
		chapter_count_chirho: countChaptersChirho(coverageChirho),
		...changesChirho
	};
	return { ...stationChirho, has_timings_chirho: stationChirho.timings_chirho !== undefined };
}
