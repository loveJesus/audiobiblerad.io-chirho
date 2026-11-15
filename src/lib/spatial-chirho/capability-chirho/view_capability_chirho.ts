// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Whether the radio may try its three-dimensional view on its own, and whether it ran smoothly
// once tried. The device's hints can only rule the view out: a browser's memory and core counts
// are rough or missing and say little about its graphics, so when nothing rules it out the real
// scene is drawn and its own frame times decide. A listener who chooses 3D skips the hints, but
// never a renderer that fails.

/** What the browser says about the device and the listener's settings. Absent means unknown. */
export interface ViewHintsChirho {
	readonly reduced_motion_chirho: boolean;
	readonly save_data_chirho: boolean;
	readonly small_display_chirho: boolean;
	/** `navigator.deviceMemory`, rounded by the browser and capped; not every browser gives it. */
	readonly memory_gb_chirho?: number;
	/** `navigator.hardwareConcurrency`; may be reported low on purpose for privacy. */
	readonly cores_chirho?: number;
}

/** The radio's shorter screen side, in CSS pixels, below which it stays simple: a watch. */
export const SMALL_DISPLAY_PX_CHIRHO = 300;
const FEW_GB_CHIRHO = 2;
const FEW_CORES_CHIRHO = 2;

export const RENDER_SAMPLES_MIN_CHIRHO = 24;
export const RENDER_SAMPLES_MAX_CHIRHO = 60;
/** About 30 frames a second or better, in the middle of the run. */
export const SMOOTH_MEDIAN_MS_CHIRHO = 34;
/** A frame this long is a visible stutter. */
export const SLOW_FRAME_MS_CHIRHO = 45;
/** Smooth only while fewer than this share of frames stutter. */
export const SLOW_FRACTION_MAX_CHIRHO = 0.2;

function positiveChirho(valueChirho: unknown): number | undefined {
	return typeof valueChirho === 'number' && Number.isFinite(valueChirho) && valueChirho > 0
		? valueChirho
		: undefined;
}

function mediaMatchesChirho(queryChirho: string): boolean {
	try {
		return globalThis.matchMedia?.(queryChirho)?.matches === true;
	} catch {
		return false;
	}
}

/**
 * Read the hints in a browser. Anything the browser does not offer is left unknown or false;
 * outside a browser every hint is unknown.
 */
export function readViewHintsChirho(): ViewHintsChirho {
	const navigatorChirho = (globalThis as { navigator?: unknown }).navigator as
		| {
				deviceMemory?: unknown;
				hardwareConcurrency?: unknown;
				connection?: { saveData?: unknown };
		  }
		| undefined;
	const screenChirho = (globalThis as { screen?: { width?: unknown; height?: unknown } }).screen;
	const sidesChirho = [screenChirho?.width, screenChirho?.height]
		.map(positiveChirho)
		.filter((sideChirho): sideChirho is number => sideChirho !== undefined);
	const memoryChirho = positiveChirho(navigatorChirho?.deviceMemory);
	const coresChirho = positiveChirho(navigatorChirho?.hardwareConcurrency);
	return {
		reduced_motion_chirho: mediaMatchesChirho('(prefers-reduced-motion: reduce)'),
		save_data_chirho: navigatorChirho?.connection?.saveData === true,
		small_display_chirho:
			sidesChirho.length > 0 && Math.min(...sidesChirho) < SMALL_DISPLAY_PX_CHIRHO,
		...(memoryChirho === undefined ? {} : { memory_gb_chirho: memoryChirho }),
		...(coresChirho === undefined ? {} : { cores_chirho: coresChirho })
	};
}

/**
 * Whether `auto` may try the 3D view at all. Reduced motion, data saving, a watch-sized screen,
 * or a known small memory or core count keep it simple; an unknown value never does.
 */
export function mayTryAutomatic3DChirho(hintsChirho: ViewHintsChirho): boolean {
	if (hintsChirho.reduced_motion_chirho || hintsChirho.save_data_chirho) return false;
	if (hintsChirho.small_display_chirho) return false;
	if (hintsChirho.memory_gb_chirho !== undefined && hintsChirho.memory_gb_chirho <= FEW_GB_CHIRHO)
		return false;
	if (hintsChirho.cores_chirho !== undefined && hintsChirho.cores_chirho <= FEW_CORES_CHIRHO)
		return false;
	return true;
}

/**
 * Judge the real scene from the time between its frames, in milliseconds. Only finite,
 * positive intervals count, and only the most recent 60, so the first frames' setup does not
 * weigh against a scene that settles. Smooth needs at least 24 of them, a median of 34 ms or
 * less, and fewer than a fifth longer than 45 ms.
 */
export function judgeRenderSamplesChirho(samplesChirho: readonly number[]): {
	smooth_chirho: boolean;
	median_ms_chirho: number | null;
	slow_fraction_chirho: number;
} {
	const intervalsChirho = samplesChirho
		.filter((sampleChirho) => Number.isFinite(sampleChirho) && sampleChirho > 0)
		.slice(-RENDER_SAMPLES_MAX_CHIRHO);
	if (intervalsChirho.length === 0) {
		return { smooth_chirho: false, median_ms_chirho: null, slow_fraction_chirho: 0 };
	}
	const sortedChirho = [...intervalsChirho].sort((aChirho, bChirho) => aChirho - bChirho);
	const middleChirho = Math.floor(sortedChirho.length / 2);
	const medianChirho =
		sortedChirho.length % 2 === 1
			? sortedChirho[middleChirho]
			: (sortedChirho[middleChirho - 1] + sortedChirho[middleChirho]) / 2;
	const slowFractionChirho =
		intervalsChirho.filter((intervalChirho) => intervalChirho > SLOW_FRAME_MS_CHIRHO).length /
		intervalsChirho.length;
	return {
		smooth_chirho:
			intervalsChirho.length >= RENDER_SAMPLES_MIN_CHIRHO &&
			medianChirho <= SMOOTH_MEDIAN_MS_CHIRHO &&
			slowFractionChirho < SLOW_FRACTION_MAX_CHIRHO,
		median_ms_chirho: medianChirho,
		slow_fraction_chirho: slowFractionChirho
	};
}
