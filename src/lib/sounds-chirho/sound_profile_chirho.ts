// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Which recordings the radio plays for each kind of feedback.
// See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
// Each build writes static/sounds-chirho/profile_chirho.json with
// scripts-chirho/sounds-chirho/prepare_sounds_chirho.ts. On the published site it names the
// purchased clips prepared locally. In a copy of the source it names the open set kept in this
// repository. The page trusts nothing in it but plain paths under /sounds-chirho/ on its own site.

export const SOUND_PROFILE_PATH_CHIRHO = '/sounds-chirho/profile_chirho.json';
export const SOUND_PROFILE_SCHEMA_CHIRHO = 'radio-sounds-profile-v1-chirho';
/** A profile is a short list of paths. Anything larger is not one. */
export const SOUND_PROFILE_MAX_BYTES_CHIRHO = 8192;

export type SoundRoleChirho = 'tuning_chirho' | 'click_chirho' | 'knob_chirho';

export interface SoundClipChirho {
	/** A path on this site, under /sounds-chirho/. */
	readonly url_chirho: string;
	/** Where in the recording to begin, for a clip whose useful sound starts late. */
	readonly start_seconds_chirho?: number;
}

export interface SoundProfileChirho {
	readonly schema_chirho: typeof SOUND_PROFILE_SCHEMA_CHIRHO;
	readonly source_chirho: 'licensed' | 'open';
	readonly tuning_chirho: readonly SoundClipChirho[];
	readonly click_chirho: readonly SoundClipChirho[];
	readonly knob_chirho: readonly SoundClipChirho[];
}

/** How many clips each kind may name, fewest and most. Tuning needs one; the others may be silent. */
const ROLE_LIMITS_CHIRHO: Readonly<Record<SoundRoleChirho, readonly [number, number]>> = {
	tuning_chirho: [1, 16],
	click_chirho: [0, 4],
	knob_chirho: [0, 4]
};
/** Lower-case segments without dots: no way out of /sounds-chirho/, and no host, query or fragment. */
const CLIP_PATH_CHIRHO = /^\/sounds-chirho\/(?:[a-z0-9_-]+\/){0,3}[a-z0-9_-]+\.wav$/;
const MAX_START_SECONDS_CHIRHO = 10;

/** The open set: original sounds kept in this repository, used wherever no profile says otherwise. */
export const OPEN_SOUND_PROFILE_CHIRHO: SoundProfileChirho = {
	schema_chirho: SOUND_PROFILE_SCHEMA_CHIRHO,
	source_chirho: 'open',
	tuning_chirho: Array.from({ length: 9 }, (_unusedChirho, indexChirho) => ({
		url_chirho: `/sounds-chirho/radio_${String(indexChirho + 1).padStart(2, '0')}_chirho.wav`
	})),
	click_chirho: [{ url_chirho: '/sounds-chirho/interface-chirho/click_chirho.wav' }],
	knob_chirho: [{ url_chirho: '/sounds-chirho/interface-chirho/knob_chirho.wav' }]
};

function parseClipChirho(valueChirho: unknown): SoundClipChirho | null {
	if (typeof valueChirho !== 'object' || valueChirho === null) return null;
	const { url_chirho: urlChirho, start_seconds_chirho: startChirho } = valueChirho as Record<
		string,
		unknown
	>;
	if (typeof urlChirho !== 'string' || !CLIP_PATH_CHIRHO.test(urlChirho)) return null;
	if (startChirho === undefined) return { url_chirho: urlChirho };
	if (
		typeof startChirho !== 'number' ||
		!Number.isFinite(startChirho) ||
		startChirho < 0 ||
		startChirho > MAX_START_SECONDS_CHIRHO
	)
		return null;
	return { url_chirho: urlChirho, start_seconds_chirho: startChirho };
}

/** A profile read from anywhere, checked field by field. Null when anything in it is out of bounds. */
export function parseSoundProfileChirho(valueChirho: unknown): SoundProfileChirho | null {
	if (typeof valueChirho !== 'object' || valueChirho === null || Array.isArray(valueChirho))
		return null;
	const recordChirho = valueChirho as Record<string, unknown>;
	const sourceChirho = recordChirho.source_chirho;
	if (recordChirho.schema_chirho !== SOUND_PROFILE_SCHEMA_CHIRHO) return null;
	if (sourceChirho !== 'licensed' && sourceChirho !== 'open') return null;
	const rolesChirho: Partial<Record<SoundRoleChirho, SoundClipChirho[]>> = {};
	for (const roleChirho of Object.keys(ROLE_LIMITS_CHIRHO) as SoundRoleChirho[]) {
		const [fewestChirho, mostChirho] = ROLE_LIMITS_CHIRHO[roleChirho];
		const listChirho = recordChirho[roleChirho];
		if (
			!Array.isArray(listChirho) ||
			listChirho.length < fewestChirho ||
			listChirho.length > mostChirho
		)
			return null;
		const clipsChirho: SoundClipChirho[] = [];
		for (const entryChirho of listChirho) {
			const clipChirho = parseClipChirho(entryChirho);
			if (!clipChirho) return null;
			clipsChirho.push(clipChirho);
		}
		rolesChirho[roleChirho] = clipsChirho;
	}
	return {
		schema_chirho: SOUND_PROFILE_SCHEMA_CHIRHO,
		source_chirho: sourceChirho,
		tuning_chirho: rolesChirho.tuning_chirho ?? [],
		click_chirho: rolesChirho.click_chirho ?? [],
		knob_chirho: rolesChirho.knob_chirho ?? []
	};
}

/** Asks this site for its profile, once. Any failure means null, and the open set; it never throws. */
export async function fetchSoundProfileChirho(
	fetchChirho: typeof fetch
): Promise<SoundProfileChirho | null> {
	try {
		const responseChirho = await fetchChirho(SOUND_PROFILE_PATH_CHIRHO, { cache: 'no-cache' });
		if (!responseChirho.ok) return null;
		const textChirho = await responseChirho.text();
		if (textChirho.length > SOUND_PROFILE_MAX_BYTES_CHIRHO) return null;
		return parseSoundProfileChirho(JSON.parse(textChirho));
	} catch {
		return null;
	}
}
