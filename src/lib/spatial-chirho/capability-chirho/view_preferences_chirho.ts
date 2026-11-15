// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The listener's choice of how the radio is drawn: chosen for them, the simple flat radio, or
// the three-dimensional one. Only the choice is kept, never anything about the device, and a
// choice that cannot be read or saved never stops the radio from playing.

import type { PreferenceStorageChirho } from '$lib/player-chirho/player_preferences_chirho';

/** `auto` lets the radio decide from the device; the others are the listener's own choice. */
export type ViewPreferenceChirho = 'auto' | 'simple' | 'three';

export const VIEW_PREFERENCE_KEY_CHIRHO = 'audio-bible-radio-view-chirho';

const VIEW_PREFERENCES_CHIRHO: readonly string[] = ['auto', 'simple', 'three'];

function isViewPreferenceChirho(valueChirho: unknown): valueChirho is ViewPreferenceChirho {
	return typeof valueChirho === 'string' && VIEW_PREFERENCES_CHIRHO.includes(valueChirho);
}

/** The remembered choice, or `auto` when there is none, it is not one, or storage refuses. */
export function readViewPreferenceChirho(
	storageChirho: PreferenceStorageChirho | null
): ViewPreferenceChirho {
	try {
		const valueChirho = storageChirho?.getItem(VIEW_PREFERENCE_KEY_CHIRHO);
		return isViewPreferenceChirho(valueChirho) ? valueChirho : 'auto';
	} catch {
		return 'auto';
	}
}

/**
 * Remember the listener's choice. Never throws. Returns whether it was saved, so the caller can
 * keep the choice for this visit when storage is missing, full or denied.
 */
export function rememberViewPreferenceChirho(
	storageChirho: PreferenceStorageChirho | null,
	preferenceChirho: ViewPreferenceChirho
): boolean {
	if (!storageChirho || !isViewPreferenceChirho(preferenceChirho)) return false;
	try {
		storageChirho.setItem(VIEW_PREFERENCE_KEY_CHIRHO, preferenceChirho);
		return true;
	} catch {
		return false;
	}
}
