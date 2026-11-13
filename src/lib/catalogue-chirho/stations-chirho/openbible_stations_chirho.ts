// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations served from the publisher's own file listing at https://openbible.com/audio/.
// Its downloads page (https://openbible.com/audio.htm) names each folder's version and voice.
//
// Not here yet, and why: the `david` folders (BSB, KJV and MSB) and the music editions have no
// maker's statement of who is speaking or under which licence. See the sources file.

import type { StationDraftChirho } from './station_builder_chirho';
import {
	BEREAN_NARRATION_CC0_CHIRHO,
	BEREAN_VERSION_CHIRHO,
	ENGLISH_CHIRHO,
	bereanCreditChirho
} from './shared_facts_chirho';

export const OPENBIBLE_SOURCE_ID_CHIRHO = 'openbible';

const GILBERT_NARRATOR_CHIRHO = 'Jordan Scott Gilbert';

export const OPENBIBLE_STATION_DRAFTS_CHIRHO: readonly StationDraftChirho[] = [
	{
		id_chirho: 'openbible-bsb-gilbert',
		source_id_chirho: OPENBIBLE_SOURCE_ID_CHIRHO,
		...ENGLISH_CHIRHO,
		...BEREAN_VERSION_CHIRHO,
		voice_chirho: GILBERT_NARRATOR_CHIRHO,
		voice_kind_chirho: 'human',
		source_name_chirho: 'Open Bible',
		source_url_chirho: 'https://openbible.com/audiobibles.htm',
		...BEREAN_NARRATION_CC0_CHIRHO,
		credit_chirho: bereanCreditChirho(GILBERT_NARRATOR_CHIRHO),
		locator_chirho: {
			kind_chirho: 'pattern',
			template_chirho:
				'https://openbible.com/audio/gilbert/BSB_{book_order_pad2_chirho}_{book_code_chirho}_{chapter_pad3_chirho}_G.mp3',
			book_codes_chirho: 'openbible_chirho'
		}
	}
];
