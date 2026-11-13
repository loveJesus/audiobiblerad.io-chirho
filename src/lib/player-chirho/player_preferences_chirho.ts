// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	STATIONS_CHIRHO,
	findBookChirho,
	findStationChirho
} from '$lib/catalogue-chirho/catalogue_chirho';
import type { PositionChirho } from './playback_position_chirho';

export const PREFERENCES_KEY_CHIRHO = 'audio-bible-radio-preferences-chirho';
export type PreferenceStorageChirho = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * The place a listener is following: the station, book, chapter and position they last chose
 * or naturally reached. It is kept apart from the place being played, so that turning the dial
 * across a station that lacks the chapter does not carry every later station away with it.
 */
export interface FollowedPlaceChirho extends PositionChirho {
	station_id_chirho: string;
	book_id_chirho: string;
	chapter_chirho: number;
}

export interface PlayerPreferencesChirho {
	station_id_chirho: string;
	book_id_chirho: string;
	chapter_chirho: number;
	seconds_chirho: number;
	sounds_enabled_chirho: boolean;
	/** Absent in preferences saved before it existed, and whenever what was saved is not valid. */
	followed_place_chirho?: FollowedPlaceChirho;
}

const MAX_SAVED_LENGTH_CHIRHO = 2048;
/** A day: longer than any chapter, and a bound on what a damaged value can claim. */
const MAX_SECONDS_CHIRHO = 86_400;
/** Far above the longest chapter's verse count, and a bound all the same. */
const MAX_VERSE_CHIRHO = 1_000;

export function defaultPreferencesChirho(): PlayerPreferencesChirho {
	return {
		station_id_chirho: STATIONS_CHIRHO[0].id_chirho,
		book_id_chirho: 'JHN',
		chapter_chirho: 1,
		seconds_chirho: 0,
		sounds_enabled_chirho: true
	};
}

function isRecordChirho(valueChirho: unknown): valueChirho is Record<string, unknown> {
	return typeof valueChirho === 'object' && valueChirho !== null && !Array.isArray(valueChirho);
}

function isNumberBetweenChirho(
	valueChirho: unknown,
	lowestChirho: number,
	highestChirho: number
): valueChirho is number {
	return (
		typeof valueChirho === 'number' &&
		Number.isFinite(valueChirho) &&
		valueChirho >= lowestChirho &&
		valueChirho <= highestChirho
	);
}

function isWholeNumberBetweenChirho(
	valueChirho: unknown,
	lowestChirho: number,
	highestChirho: number
): valueChirho is number {
	return (
		isNumberBetweenChirho(valueChirho, lowestChirho, highestChirho) && Number.isInteger(valueChirho)
	);
}

/**
 * Read a saved followed place. It stands or falls as a whole: one field that is not valid and
 * the listener simply has no followed place, which is what a first run looks like. Only the
 * fields named here are kept, so nothing else that was stored rides along.
 */
function readFollowedPlaceChirho(valueChirho: unknown): FollowedPlaceChirho | undefined {
	if (!isRecordChirho(valueChirho)) return undefined;
	const stationChirho = findStationChirho(valueChirho.station_id_chirho);
	const bookChirho = findBookChirho(valueChirho.book_id_chirho);
	if (!stationChirho || !bookChirho) return undefined;

	const {
		chapter_chirho: chapterChirho,
		seconds_chirho: secondsChirho,
		duration_chirho: durationChirho,
		verse_chirho: verseChirho,
		verse_fraction_chirho: verseFractionChirho
	} = valueChirho;
	if (!isWholeNumberBetweenChirho(chapterChirho, 1, bookChirho.chapters_chirho)) return undefined;
	if (!isNumberBetweenChirho(secondsChirho, 0, MAX_SECONDS_CHIRHO)) return undefined;
	if (!isNumberBetweenChirho(durationChirho, 0, MAX_SECONDS_CHIRHO)) return undefined;
	if (verseChirho !== null && !isWholeNumberBetweenChirho(verseChirho, 1, MAX_VERSE_CHIRHO)) {
		return undefined;
	}
	if (!isNumberBetweenChirho(verseFractionChirho, 0, 1)) return undefined;

	return {
		station_id_chirho: stationChirho.id_chirho,
		book_id_chirho: bookChirho.id_chirho,
		chapter_chirho: chapterChirho,
		seconds_chirho: secondsChirho,
		duration_chirho: durationChirho,
		verse_chirho: verseChirho,
		verse_fraction_chirho: verseFractionChirho
	};
}

// Device memory follows spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.
// Local storage is untrusted and optional. A broken/private storage area must not prevent listening.
export function readPreferencesChirho(storageChirho: PreferenceStorageChirho | null): {
	preferences_chirho: PlayerPreferencesChirho;
	available_chirho: boolean;
} {
	const fallbackChirho = defaultPreferencesChirho();
	if (!storageChirho) return { preferences_chirho: fallbackChirho, available_chirho: false };
	let rawChirho: string | null;
	try {
		rawChirho = storageChirho.getItem(PREFERENCES_KEY_CHIRHO);
	} catch {
		return { preferences_chirho: fallbackChirho, available_chirho: false };
	}
	try {
		if (!rawChirho) return { preferences_chirho: fallbackChirho, available_chirho: true };
		if (rawChirho.length > MAX_SAVED_LENGTH_CHIRHO)
			return { preferences_chirho: fallbackChirho, available_chirho: true };
		const valueChirho: unknown = JSON.parse(rawChirho);
		if (!valueChirho || typeof valueChirho !== 'object')
			return { preferences_chirho: fallbackChirho, available_chirho: true };
		const candidateChirho = valueChirho as Record<string, unknown>;
		const stationChirho = findStationChirho(candidateChirho.station_id_chirho);
		const bookChirho = findBookChirho(candidateChirho.book_id_chirho);
		const chapterChirho = candidateChirho.chapter_chirho;
		const secondsChirho = candidateChirho.seconds_chirho;
		// The followed place is judged on its own: a place that is not valid is dropped and the
		// preferences beside it, which older versions saved without one, are kept as they are.
		const followedPlaceChirho = readFollowedPlaceChirho(candidateChirho.followed_place_chirho);
		return {
			preferences_chirho: {
				station_id_chirho: stationChirho?.id_chirho ?? fallbackChirho.station_id_chirho,
				book_id_chirho: bookChirho?.id_chirho ?? fallbackChirho.book_id_chirho,
				chapter_chirho:
					bookChirho && isWholeNumberBetweenChirho(chapterChirho, 1, bookChirho.chapters_chirho)
						? chapterChirho
						: 1,
				seconds_chirho: isNumberBetweenChirho(secondsChirho, 0, MAX_SECONDS_CHIRHO)
					? secondsChirho
					: 0,
				sounds_enabled_chirho:
					typeof candidateChirho.sounds_enabled_chirho === 'boolean'
						? candidateChirho.sounds_enabled_chirho
						: true,
				...(followedPlaceChirho ? { followed_place_chirho: followedPlaceChirho } : {})
			},
			available_chirho: true
		};
	} catch {
		return { preferences_chirho: fallbackChirho, available_chirho: true };
	}
}
