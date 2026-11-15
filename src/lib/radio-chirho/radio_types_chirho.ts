// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { LanguageEntryChirho, StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';
import type { RadioStateChirho } from '$lib/player-chirho/radio_player_chirho';

export interface RadioSessionViewChirho {
	state_chirho: RadioStateChirho;
	stations_chirho: readonly StationChirho[];
	languages_chirho: readonly LanguageEntryChirho[];
	dial_language_chirho?: string;
	language_loading_chirho: string;
	language_message_chirho: string;
	restoring_chirho: boolean;
	restore_failed_chirho: boolean;
	needs_gesture_chirho: boolean;
	ready_chirho: boolean;
}

export type AutoplayPolicyChirho = 'allowed' | 'allowed-muted' | 'disallowed' | 'unknown';
export const POWER_KEY_CHIRHO = 'audio-bible-radio-power-chirho';
