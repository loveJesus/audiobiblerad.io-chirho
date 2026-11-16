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
/**
 * A click or tick not finished this long after the press has stalled and is let go. Some WebKit
 * runs add startup and completion-event overhead to a clip's own length (measured, and variable),
 * so this leaves room for a slow start.
 */
const INTERFACE_CEILING_MS_CHIRHO = 2000;
/** Knob steps closer together than this share one tick, so a fast turn ratchets instead of buzzing. */
const KNOB_SPACING_MS_CHIRHO = 60;

export interface RadioSoundsChirho {
	/** One tuning cue while a station loads. It replaces any tuning cue already sounding. */
	startChirho(): void;
	/** Stops the tuning cue only, so a click that follows Off is still heard. */
	stopChirho(): void;
	/**
	 * Stops every channel at once, a click or tick already sounding included, as turning the sounds
	 * off does. The switch stays as it is, nothing asks for the profile, and later deliberate sounds
	 * play as usual.
	 */
	silenceChirho?(): void;
	/** False silences every channel at once. */
	setEnabledChirho(enabledChirho: boolean): void;
	/** Silences everything for good. Later calls do nothing. */
	disposeChirho(): void;
	/** A deliberate press of a button. It always sounds, replacing a click or knob tick. */
	clickChirho?(): void;
	/**
	 * One deliberate step of a knob. It sounds only while the controls are quiet: a click is never
	 * cut, a tick already under way finishes first, and steps closer than 60 ms share a tick.
	 */
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
	const stopEveryChannelChirho = (): void => {
		tuningChirho.stopChirho();
		interfaceChirho.stopChirho();
	};

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
		silenceChirho() {
			// Unlike turning the sounds off, this leaves the switch alone and asks for nothing.
			stopEveryChannelChirho();
		},
		setEnabledChirho(valueChirho) {
			enabledChirho = valueChirho;
			if (!activeChirho()) stopEveryChannelChirho();
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
			interfaceChirho.playChirho(clipChirho);
		},
		knobChirho() {
			const clipChirho = activeChirho() ? pickChirho(profileChirho.knob_chirho) : undefined;
			if (!clipChirho) return;
			const atChirho = nowChirho();
			if (atChirho - lastKnobAtChirho < KNOB_SPACING_MS_CHIRHO) return;
			// Nothing cuts a click, and a tick under way finishes: restarting one whose clock has not
			// started yet would keep a slow engine silent through a fast turn. The channel's ceiling
			// still lets a stalled tick go, so the knob is never held quiet for long.
			if (interfaceChirho.current_chirho) return;
			lastKnobAtChirho = atChirho;
			interfaceChirho.playChirho(clipChirho);
		}
	};
}
