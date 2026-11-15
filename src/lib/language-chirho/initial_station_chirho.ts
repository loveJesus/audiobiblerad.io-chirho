// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';

// First-run selection follows spec-chirho/workflows-chirho/language_workflow_chirho.md.
// A language preference is local device input, never an IP/geolocation lookup.
export function matchBrowserLanguageChirho(
	preferredChirho: readonly string[],
	availableChirho: readonly string[]
): string | undefined {
	const codesChirho = new Set(availableChirho);
	for (const preferenceChirho of preferredChirho.slice(0, 8)) {
		if (preferenceChirho.length > 35) continue;
		let codeChirho: string;
		try {
			codeChirho = Intl.getCanonicalLocales(preferenceChirho)[0].toLowerCase();
		} catch {
			continue;
		}
		while (codeChirho) {
			if (codesChirho.has(codeChirho)) return codeChirho;
			const separatorChirho = codeChirho.lastIndexOf('-');
			codeChirho = separatorChirho < 0 ? '' : codeChirho.slice(0, separatorChirho);
		}
	}
	return undefined;
}

// Conservative available-catalogue defaults, not a claim of theological unanimity.
// The catalogue itself already withholds translations explicitly marked as drafts.
const TRANSLATION_PREFERENCES_CHIRHO: Readonly<Record<string, readonly RegExp[]>> = {
	en: [/berean standard/i, /world english/i],
	es: [/reina.valera/i],
	de: [/luther/i],
	pt: [/almeida/i],
	zh: [/union/i],
	nl: [/statenvertaling/i],
	fr: [/segond/i, /semeur/i],
	hi: [/contemporary/i]
};
// Published first-person narrator description: https://bobsouer.com/blog/.
// This is a positive default preference only. No unnamed/mixed/female voice is removed.
const DOCUMENTED_MALE_NARRATORS_CHIRHO = new Set(['helloao-bsb-souer']);

export function initialStationChirho(
	stationsChirho: readonly StationChirho[],
	codeChirho: string,
	randomChirho: () => number = Math.random
): StationChirho | undefined {
	if (stationsChirho.length === 0) return undefined;
	const patternsChirho = TRANSLATION_PREFERENCES_CHIRHO[codeChirho.split('-')[0]] ?? [];
	const rankChirho = (stationChirho: StationChirho): number => {
		const preferenceChirho = patternsChirho.findIndex((patternChirho) =>
			patternChirho.test(stationChirho.version_chirho)
		);
		return (
			(preferenceChirho < 0 ? 0 : (patternsChirho.length - preferenceChirho) * 10000) +
			Math.min(stationChirho.chapter_count_chirho, 1189) +
			(stationChirho.voice_kind_chirho === 'human' ? 20 : 0)
		);
	};
	const orderedChirho = [...stationsChirho].sort(
		(leftChirho, rightChirho) => rankChirho(rightChirho) - rankChirho(leftChirho)
	);
	const firstChirho = orderedChirho[0];
	const sameVersionChirho = orderedChirho.filter(
		(stationChirho) =>
			stationChirho.version_chirho === firstChirho.version_chirho &&
			stationChirho.chapter_count_chirho >= firstChirho.chapter_count_chirho
	);
	const preferredMaleChirho = sameVersionChirho.filter((stationChirho) =>
		DOCUMENTED_MALE_NARRATORS_CHIRHO.has(stationChirho.id_chirho)
	);
	const choicesChirho = preferredMaleChirho.length ? preferredMaleChirho : sameVersionChirho;
	const indexChirho = Math.min(
		choicesChirho.length - 1,
		Math.max(0, Math.floor(randomChirho() * choicesChirho.length))
	);
	return choicesChirho[indexChirho];
}
