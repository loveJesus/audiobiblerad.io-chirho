// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	createSoundChannelChirho,
	type SoundChannelChirho,
	type SoundElementChirho
} from './sound_channel_chirho';
import {
	OPEN_SOUND_PROFILE_CHIRHO,
	fetchSoundProfileChirho,
	type SoundClipChirho,
	type SoundProfileChirho
} from './sound_profile_chirho';

// The radio's feedback sounds: a tuning cue while a station loads, a click for a button and a tick
// for a knob. See spec-chirho/workflows-chirho/radio_sounds_workflow_chirho.md.
//
// Scripture never comes through here. Two short-lived audio elements play the effects: one for
// tuning, one shared by click and knob. Everything is finite, nothing loops, and nothing waits
// for the sound profile.

/** A stalled or long tuning cue stops here, even if its recording has not ended. */
const TUNING_CEILING_MS_CHIRHO = 1500;
const INTERFACE_CEILING_MS_CHIRHO = 1200;
/** Knob steps closer together than this share one tick, so a fast turn ratchets instead of buzzing. */
const KNOB_SPACING_MS_CHIRHO = 60;

export interface RadioSoundsChirho {
	/** One tuning cue while a station loads. It replaces any tuning cue already sounding. */
	startChirho(): void;
	/** Stops the tuning cue only, so a click that follows Off is still heard. */
	stopChirho(): void;
	/** False silences every channel at once. */
	setEnabledChirho(enabledChirho: boolean): void;
	/** Silences everything for good. Later calls do nothing. */
	disposeChirho(): void;
	/** A deliberate press of a button. It always sounds, replacing a click or knob tick. */
	clickChirho?(): void;
	/** One deliberate step of a knob. Steps closer than 60 ms share a tick; a click is never cut. */
	knobChirho?(): void;
}

export interface RadioSoundsOptionsChirho {
	/** Makes each channel's audio element. Tests pass stand-ins. */
	create_element_chirho?: () => SoundElementChirho;
	/** Asks the site for its sound profile. Null never asks, and keeps the open set. */
	fetch_chirho?: typeof fetch | null;
	now_chirho?: () => number;
	random_chirho?: () => number;
}

export function createRadioSoundsChirho(
	optionsChirho: RadioSoundsOptionsChirho = {}
): RadioSoundsChirho {
	const createElementChirho = optionsChirho.create_element_chirho ?? (() => new Audio());
	const nowChirho = optionsChirho.now_chirho ?? (() => performance.now());
	const randomChirho = optionsChirho.random_chirho ?? Math.random;
	const tuningChirho: SoundChannelChirho = createSoundChannelChirho(createElementChirho(), {
		ceiling_ms_chirho: TUNING_CEILING_MS_CHIRHO,
		keep_loaded_chirho: false
	});
	const interfaceChirho: SoundChannelChirho = createSoundChannelChirho(createElementChirho(), {
		ceiling_ms_chirho: INTERFACE_CEILING_MS_CHIRHO,
		keep_loaded_chirho: true
	});
	let profileChirho: SoundProfileChirho = OPEN_SOUND_PROFILE_CHIRHO;
	let enabledChirho = true;
	let disposedChirho = false;
	let lastTuningChirho = -1;
	let lastKnobAtChirho = Number.NEGATIVE_INFINITY;
	let interfaceKindChirho: 'click' | 'knob' | null = null;

	const fetchChirho =
		optionsChirho.fetch_chirho === undefined
			? typeof fetch === 'function'
				? fetch.bind(globalThis)
				: null
			: optionsChirho.fetch_chirho;
	let askedChirho = false;
	// One small request, made once the sounds are on and never awaited: until it answers, and if
	// it fails, the open set plays. With the sounds off, as in an embedded widget, nothing is asked.
	const askForProfileChirho = (): void => {
		if (askedChirho || !fetchChirho || disposedChirho) return;
		askedChirho = true;
		void fetchSoundProfileChirho(fetchChirho).then((foundChirho) => {
			if (foundChirho && !disposedChirho) profileChirho = foundChirho;
		});
	};

	const activeChirho = (): boolean => {
		if (!enabledChirho || disposedChirho) return false;
		askForProfileChirho();
		return true;
	};
	const pickChirho = (clipsChirho: readonly SoundClipChirho[]): SoundClipChirho | undefined =>
		clipsChirho[Math.floor(randomChirho() * clipsChirho.length)];

	return {
		startChirho() {
			tuningChirho.stopChirho();
			if (!activeChirho()) return;
			const countChirho = profileChirho.tuning_chirho.length;
			// Never the same cue twice in a row.
			const variantChirho =
				lastTuningChirho < 0 || countChirho < 2 || lastTuningChirho >= countChirho
					? Math.floor(randomChirho() * countChirho)
					: (lastTuningChirho + 1 + Math.floor(randomChirho() * (countChirho - 1))) % countChirho;
			lastTuningChirho = variantChirho;
			tuningChirho.playChirho(profileChirho.tuning_chirho[variantChirho]);
		},
		stopChirho() {
			tuningChirho.stopChirho();
		},
		setEnabledChirho(valueChirho) {
			enabledChirho = valueChirho;
			if (activeChirho()) return;
			tuningChirho.stopChirho();
			interfaceChirho.stopChirho();
		},
		disposeChirho() {
			disposedChirho = true;
			enabledChirho = false;
			tuningChirho.disposeChirho();
			interfaceChirho.disposeChirho();
		},
		clickChirho() {
			const clipChirho = activeChirho() ? pickChirho(profileChirho.click_chirho) : undefined;
			if (!clipChirho) return;
			interfaceKindChirho = 'click';
			interfaceChirho.playChirho(clipChirho);
		},
		knobChirho() {
			const clipChirho = activeChirho() ? pickChirho(profileChirho.knob_chirho) : undefined;
			if (!clipChirho) return;
			const atChirho = nowChirho();
			if (atChirho - lastKnobAtChirho < KNOB_SPACING_MS_CHIRHO) return;
			if (interfaceChirho.current_chirho && interfaceKindChirho === 'click') return;
			lastKnobAtChirho = atChirho;
			interfaceKindChirho = 'knob';
			interfaceChirho.playChirho(clipChirho);
		}
	};
}
