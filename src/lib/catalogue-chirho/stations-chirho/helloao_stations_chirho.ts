// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations served by the Free Use Bible API (bible.helloao.org). It serves audio with verse
// timings, which is what lets the dial keep the verse. Its own source lists which
// translations have audio: packages/helloao-tools/generation/audio.ts in
// github.com/HelloAOLab/bible-api.
//
// Not here yet, and why: its `david` voice and its Mandarin recording have no maker's
// statement of who is speaking or under which licence. See the sources file.

import type { StationDraftChirho } from './station_builder_chirho';
import {
	BEREAN_NARRATION_CC0_CHIRHO,
	BEREAN_VERSION_CHIRHO,
	ENGLISH_CHIRHO,
	bereanCreditChirho
} from './shared_facts_chirho';

export const HELLOAO_SOURCE_ID_CHIRHO = 'helloao';

function bereanStationChirho(readerChirho: string, narratorChirho: string): StationDraftChirho {
	return {
		id_chirho: `helloao-bsb-${readerChirho}`,
		source_id_chirho: HELLOAO_SOURCE_ID_CHIRHO,
		...ENGLISH_CHIRHO,
		...BEREAN_VERSION_CHIRHO,
		voice_chirho: narratorChirho,
		voice_kind_chirho: 'human',
		source_name_chirho: 'Free Use Bible API',
		source_url_chirho: 'https://bible.helloao.org/',
		...BEREAN_NARRATION_CC0_CHIRHO,
		credit_chirho: bereanCreditChirho(narratorChirho),
		locator_chirho: {
			kind_chirho: 'pattern',
			template_chirho: `https://audio.bible.helloao.org/api/BSB/{book_upper_chirho}/{chapter_chirho}/audio/${readerChirho}.mp3`
		},
		timings_chirho: {
			template_chirho: `https://bible.helloao.org/api/BSB/{book_upper_chirho}/{chapter_chirho}.${readerChirho}.audioTimings.json`,
			format_chirho: 'verse-starts-list-chirho'
		}
	};
}

export const HELLOAO_STATION_DRAFTS_CHIRHO: readonly StationDraftChirho[] = [
	bereanStationChirho('hays', 'Barry Hays'),
	bereanStationChirho('souer', 'Bob Souer')
];
