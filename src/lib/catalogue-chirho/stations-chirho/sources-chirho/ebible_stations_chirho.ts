// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Stations served by eBible.org, the home of the World English Bible.
//
// The British Edition's audio folder (https://ebible.org/eng-webbe/mp3/) holds every chapter
// under regular names, in small files that start quickly. The publisher's audio page says of
// it: "World English Bible British Edition audio is free to download and use". Each file's own
// tag says: "Text by EBible.org. Audio by PublicDomainAudioBibles.com. The text and audio are
// released to the public domain and can be used without restriction".
//
// Its licence is clear. It is held back by our own choice, for the reason given below. Other
// recordings on this host are not here at all, and the sources file says why.

import type { HeldStationChirho } from '../station_builder_chirho';
import { ENGLISH_CHIRHO } from './shared_facts_chirho';

export const EBIBLE_SOURCE_ID_CHIRHO = 'ebible';

export const EBIBLE_HELD_STATIONS_CHIRHO: readonly HeldStationChirho[] = [
	{
		reason_chirho:
			'The licence is clear. It is held by the fleet’s own choice: its maker, PublicDomainAudioBibles.com, says its other recordings were made with a text to speech engine, no page says whether this one was, and the owner has not yet said whether he wants synthetic voices as stations.',
		draft_chirho: {
			id_chirho: 'ebible-webbe',
			source_id_chirho: EBIBLE_SOURCE_ID_CHIRHO,
			...ENGLISH_CHIRHO,
			version_chirho: 'World English Bible British Edition',
			version_code_chirho: 'WEBBE',
			voice_chirho: '',
			voice_kind_chirho: 'unknown',
			source_name_chirho: 'eBible.org',
			source_url_chirho: 'https://ebible.org/Scriptures/details.php?id=eng-webbe',
			licence_id_chirho: 'public-domain',
			licence_name_chirho: 'Public domain, by the maker’s release',
			licence_url_chirho: 'https://ebible.org/webaudio/',
			licence_evidence_url_chirho: 'https://ebible.org/webaudio/',
			licence_read_on_chirho: '2026-11-13',
			credit_chirho:
				'World English Bible British Edition. Text by eBible.org, audio by PublicDomainAudioBibles.com, both released to the public domain.',
			locator_chirho: {
				kind_chirho: 'pattern',
				template_chirho:
					'https://ebible.org/eng-webbe/mp3/eng-webbe_{book_code_chirho}_{chapter_pad_book_chirho}.mp3',
				book_codes_chirho: 'ebible_numbered_chirho'
			}
		}
	}
];
