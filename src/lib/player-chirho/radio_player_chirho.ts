// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BOOKS_CHIRHO,
	STATIONS_CHIRHO,
	offeredChapterAtOrAfterChirho,
	nextOfferedChapterChirho,
	parseVerseTimingsChirho,
	resolveChapterChirho,
	resolveChapterPlaybackChirho,
	type StationChirho
} from '$lib/catalogue-chirho/catalogue_chirho';
import type { RadioSoundsChirho } from '$lib/sounds-chirho/radio_sounds_chirho';
import {
	capturePositionChirho,
	mapPositionChirho,
	type PositionChirho
} from './playback_position_chirho';
import {
	PREFERENCES_KEY_CHIRHO,
	readPreferencesChirho,
	type PlayerPreferencesChirho,
	type PreferenceStorageChirho
} from './player_preferences_chirho';
import type { FollowedPlaceChirho } from './player_preferences_chirho';
import { readBoundedTimingsChirho } from './verse_timings_chirho';
import { ChapterTrackChirho } from './chapter_track_chirho';

export interface RadioStateChirho extends PlayerPreferencesChirho {
	phase_chirho: 'ready' | 'loading' | 'playing' | 'paused' | 'error';
	duration_chirho: number;
	verse_chirho: number | null;
	message_chirho: string;
	storage_available_chirho: boolean;
	first_sound_ms_chirho: number | null;
	switch_ms_chirho: number | null;
	position_mode_chirho: 'start' | 'seconds' | 'fraction' | 'verse';
}

export interface RadioOptionsChirho {
	audio_chirho: HTMLAudioElement;
	sounds_chirho: RadioSoundsChirho;
	storage_chirho: PreferenceStorageChirho | null;
	on_change_chirho(stateChirho: RadioStateChirho): void;
	on_autoplay_blocked_chirho?(): void;
	now_chirho?: () => number;
	fetch_chirho?: typeof fetch;
	stations_chirho?: readonly StationChirho[];
	preferences_chirho?: PlayerPreferencesChirho;
}

const ZERO_POSITION_CHIRHO: PositionChirho = {
	seconds_chirho: 0,
	duration_chirho: 0,
	verse_chirho: null,
	verse_fraction_chirho: 0
};
const LOAD_TIMEOUT_MS_CHIRHO = 15_000;
const MAX_RECOVERY_CHIRHO = 3;

interface RecoveryOriginChirho {
	book_id_chirho: string;
	chapter_chirho: number;
	position_chirho: PositionChirho;
	followed_place_chirho: FollowedPlaceChirho;
}

// Playback state and recovery follow spec-chirho/workflows-chirho/tune_in_workflow_chirho.md.
export class RadioPlayerChirho {
	private stateChirho: RadioStateChirho;
	private readonly audioChirho: HTMLAudioElement;
	private readonly optionsChirho: RadioOptionsChirho;
	private readonly nowChirho: () => number;
	private readonly timingsChirho = new Map<string, readonly number[] | null>();
	private readonly timingRequestsChirho = new Map<string, AbortController>();
	private readonly listenersChirho: Array<() => void> = [];
	private timeoutChirho: ReturnType<typeof setTimeout> | undefined;
	private requestChirho = 0;
	private playAttemptChirho = 0;
	private disposedChirho = false;
	private lastSaveChirho = -Infinity;
	private expectedUrlChirho = '';
	private requestedAtChirho = 0;
	private switchingChirho = false;
	private pendingPositionChirho = ZERO_POSITION_CHIRHO;
	private pendingSecondsChirho: number | null = null;
	private seekFinishedChirho = false;
	private hasPlayedChirho = false;
	private followedPlaceChirho: FollowedPlaceChirho;
	private recoveryOriginChirho: RecoveryOriginChirho | null = null;
	private stationsChirho: readonly StationChirho[];
	private stationsByIdChirho: Map<string, StationChirho>;
	private selectedStationChirho: StationChirho;
	private trackChirho: ChapterTrackChirho | null = null;
	private partIndexChirho = 0;
	private mediaDurationChirho = 0;
	private automaticChirho = false;

	constructor(optionsChirho: RadioOptionsChirho) {
		this.optionsChirho = optionsChirho;
		this.audioChirho = optionsChirho.audio_chirho;
		this.nowChirho = optionsChirho.now_chirho ?? (() => performance.now());
		const savedChirho = readPreferencesChirho(optionsChirho.storage_chirho);
		if (optionsChirho.preferences_chirho)
			savedChirho.preferences_chirho = { ...optionsChirho.preferences_chirho };
		this.stationsChirho = optionsChirho.stations_chirho?.length
			? optionsChirho.stations_chirho
			: STATIONS_CHIRHO;
		this.stationsByIdChirho = new Map(
			this.stationsChirho.map((stationChirho) => [stationChirho.id_chirho, stationChirho])
		);
		this.selectedStationChirho =
			this.stationsByIdChirho.get(savedChirho.preferences_chirho.station_id_chirho) ??
			this.stationsChirho[0];
		savedChirho.preferences_chirho.station_id_chirho = this.selectedStationChirho.id_chirho;
		this.followedPlaceChirho = savedChirho.preferences_chirho.followed_place_chirho
			? { ...savedChirho.preferences_chirho.followed_place_chirho }
			: {
					station_id_chirho: savedChirho.preferences_chirho.station_id_chirho,
					language_code_chirho: this.selectedStationChirho.language_code_chirho,
					book_id_chirho: savedChirho.preferences_chirho.book_id_chirho,
					chapter_chirho: savedChirho.preferences_chirho.chapter_chirho,
					...capturePositionChirho(savedChirho.preferences_chirho.seconds_chirho, 0, null)
				};
		const savedStationChirho = this.selectedStationChirho;
		const landingChirho = offeredChapterAtOrAfterChirho(
			savedStationChirho,
			savedChirho.preferences_chirho.book_id_chirho,
			savedChirho.preferences_chirho.chapter_chirho
		);
		if (
			landingChirho &&
			(landingChirho.book_id_chirho !== savedChirho.preferences_chirho.book_id_chirho ||
				landingChirho.chapter_chirho !== savedChirho.preferences_chirho.chapter_chirho)
		) {
			Object.assign(savedChirho.preferences_chirho, landingChirho, { seconds_chirho: 0 });
		}
		const preferencesStateChirho = { ...savedChirho.preferences_chirho };
		delete preferencesStateChirho.followed_place_chirho;
		this.stateChirho = {
			...preferencesStateChirho,
			phase_chirho: 'ready',
			duration_chirho: 0,
			verse_chirho: null,
			message_chirho: '',
			storage_available_chirho: savedChirho.available_chirho,
			first_sound_ms_chirho: null,
			switch_ms_chirho: null,
			position_mode_chirho: 'start'
		};
		this.audioChirho.preload = 'none';
		this.optionsChirho.sounds_chirho.setEnabledChirho(this.stateChirho.sounds_enabled_chirho);
		this.emitChirho();
		this.prefetchTimingsChirho();
	}

	get snapshotChirho(): RadioStateChirho {
		return { ...this.stateChirho, followed_place_chirho: { ...this.followedPlaceChirho } };
	}
	get stationChirho(): StationChirho {
		return this.selectedStationChirho;
	}

	/** Replace the active dial rather than accumulating every language ever visited. */
	setStationsChirho(stationsChirho: readonly StationChirho[], languageCodeChirho?: string): void {
		if (this.disposedChirho || stationsChirho.length === 0) return;
		this.stationsChirho = stationsChirho;
		this.stationsByIdChirho = new Map(
			stationsChirho.map((stationChirho) => [stationChirho.id_chirho, stationChirho])
		);
		this.emitChirho({ dial_language_chirho: languageCodeChirho });
		this.saveChirho();
	}

	private emitChirho(patchChirho: Partial<RadioStateChirho> = {}): void {
		if (this.disposedChirho) return;
		this.stateChirho = { ...this.stateChirho, ...patchChirho };
		this.optionsChirho.on_change_chirho(this.snapshotChirho);
	}

	private currentTimingsChirho(): readonly number[] | null {
		const chapterChirho = resolveChapterChirho(
			this.stationChirho,
			this.stateChirho.book_id_chirho,
			this.stateChirho.chapter_chirho
		);
		return chapterChirho?.timings_url_chirho
			? (this.timingsChirho.get(chapterChirho.timings_url_chirho) ?? null)
			: null;
	}

	private captureChirho(): PositionChirho {
		if (!this.hasPlayedChirho && !this.seekFinishedChirho && this.pendingSecondsChirho === null)
			return this.pendingPositionChirho;
		return capturePositionChirho(
			this.stateChirho.seconds_chirho,
			this.stateChirho.duration_chirho,
			this.currentTimingsChirho()
		);
	}

	private isFollowedPassageChirho(): boolean {
		return (
			this.stateChirho.book_id_chirho === this.followedPlaceChirho.book_id_chirho &&
			this.stateChirho.chapter_chirho === this.followedPlaceChirho.chapter_chirho
		);
	}

	private updateFollowedPositionChirho(): void {
		if (
			(!this.hasPlayedChirho && !this.seekFinishedChirho) ||
			this.stateChirho.duration_chirho <= 0 ||
			this.recoveryOriginChirho ||
			!this.isFollowedPassageChirho()
		)
			return;
		this.followedPlaceChirho = {
			station_id_chirho: this.stateChirho.station_id_chirho,
			language_code_chirho: this.stationChirho.language_code_chirho,
			book_id_chirho: this.stateChirho.book_id_chirho,
			chapter_chirho: this.stateChirho.chapter_chirho,
			...this.captureChirho()
		};
	}

	private landReadyChirho(): void {
		const landingChirho = offeredChapterAtOrAfterChirho(
			this.stationChirho,
			this.followedPlaceChirho.book_id_chirho,
			this.followedPlaceChirho.chapter_chirho
		);
		if (landingChirho) {
			const samePassageChirho =
				landingChirho.book_id_chirho === this.followedPlaceChirho.book_id_chirho &&
				landingChirho.chapter_chirho === this.followedPlaceChirho.chapter_chirho;
			this.emitChirho({
				...landingChirho,
				seconds_chirho: samePassageChirho ? this.followedPlaceChirho.seconds_chirho : 0,
				duration_chirho: 0,
				verse_chirho: null
			});
		}
		this.prefetchTimingsChirho();
		this.saveChirho();
	}

	private listenChirho(nameChirho: string, callbackChirho: () => void): void {
		const requestChirho = this.requestChirho;
		const wrappedChirho = (): void => {
			if (
				!this.disposedChirho &&
				requestChirho === this.requestChirho &&
				this.audioChirho.currentSrc === this.expectedUrlChirho
			)
				callbackChirho();
		};
		this.audioChirho.addEventListener(nameChirho, wrappedChirho);
		this.listenersChirho.push(() =>
			this.audioChirho.removeEventListener(nameChirho, wrappedChirho)
		);
	}

	private clearTrackChirho(): void {
		this.playAttemptChirho += 1;
		clearTimeout(this.timeoutChirho);
		for (const removeChirho of this.listenersChirho.splice(0)) removeChirho();
		this.audioChirho.pause();
		this.optionsChirho.sounds_chirho.stopChirho();
	}

	private updateMediaPositionChirho(): void {
		if (
			!this.trackChirho ||
			this.audioChirho.readyState < 1 ||
			(!this.hasPlayedChirho && !this.seekFinishedChirho)
		)
			return;
		const durationChirho = this.mediaDurationChirho || this.audioChirho.duration;
		const positionChirho = capturePositionChirho(
			this.trackChirho.chapterSecondsChirho(
				this.audioChirho.currentTime,
				this.partIndexChirho,
				durationChirho
			),
			this.trackChirho.durationChirho(durationChirho),
			this.currentTimingsChirho()
		);
		this.emitChirho({
			seconds_chirho: positionChirho.seconds_chirho,
			duration_chirho: positionChirho.duration_chirho,
			verse_chirho: positionChirho.verse_chirho
		});
	}

	private seekPendingChirho(): void {
		const trackChirho = this.trackChirho;
		if (!trackChirho || this.audioChirho.readyState < 1) return;
		const mediaDurationChirho = this.audioChirho.duration;
		if (
			this.mediaDurationChirho === 0 &&
			!trackChirho.acceptsDurationChirho(this.partIndexChirho, mediaDurationChirho)
		) {
			if (trackChirho.compositeChirho)
				this.failChirho('This chapter could not load correctly. Try another station.');
			return;
		}
		if (!Number.isFinite(mediaDurationChirho) || mediaDurationChirho <= 0) return;
		// Judge the first metadata only; later VBR refinements must not interrupt good audio.
		this.mediaDurationChirho = mediaDurationChirho;
		if (this.seekFinishedChirho) return;
		const durationChirho = trackChirho.durationChirho(mediaDurationChirho);
		const timingsChirho = this.currentTimingsChirho();
		const mappedChirho = mapPositionChirho(
			this.pendingPositionChirho,
			durationChirho,
			timingsChirho
		);
		const secondsChirho =
			this.pendingSecondsChirho === null
				? mappedChirho.seconds_chirho
				: Math.min(this.pendingSecondsChirho, Math.max(0, durationChirho - 0.1));
		try {
			this.audioChirho.currentTime = trackChirho.mediaSecondsChirho(
				secondsChirho,
				this.partIndexChirho,
				mediaDurationChirho
			);
		} catch {
			return;
		}
		this.seekFinishedChirho =
			this.pendingSecondsChirho !== null ||
			!this.stationChirho.has_timings_chirho ||
			this.pendingPositionChirho.verse_chirho === null ||
			timingsChirho !== null;
		this.emitChirho({
			duration_chirho: durationChirho,
			seconds_chirho: secondsChirho,
			position_mode_chirho: trackChirho.compositeChirho
				? this.stateChirho.position_mode_chirho
				: this.pendingSecondsChirho === null
					? mappedChirho.mode_chirho
					: 'seconds'
		});
	}

	private failChirho(messageChirho: string): void {
		this.updateFollowedPositionChirho();
		const originChirho = this.recoveryOriginChirho;
		this.recoveryOriginChirho = null;
		if (originChirho) this.followedPlaceChirho = { ...originChirho.followed_place_chirho };
		this.clearTrackChirho();
		this.hasPlayedChirho = false;
		this.seekFinishedChirho = false;
		this.audioChirho.removeAttribute('src');
		this.audioChirho.load();
		this.emitChirho({
			...(originChirho
				? {
						book_id_chirho: originChirho.book_id_chirho,
						chapter_chirho: originChirho.chapter_chirho,
						seconds_chirho: originChirho.position_chirho.seconds_chirho,
						duration_chirho: originChirho.position_chirho.duration_chirho,
						verse_chirho: originChirho.position_chirho.verse_chirho
					}
				: {}),
			phase_chirho: 'error',
			message_chirho: messageChirho
		});
		this.saveChirho();
	}

	private beginTrackChirho(
		playChirho: boolean,
		positionChirho: PositionChirho,
		secondsChirho: number | null,
		recoveryChirho = 0,
		tuningChirho = true
	): void {
		if (this.disposedChirho) return;
		const landingChirho = offeredChapterAtOrAfterChirho(
			this.stationChirho,
			this.stateChirho.book_id_chirho,
			this.stateChirho.chapter_chirho
		);
		if (!landingChirho) {
			this.failChirho('This station has no available chapters. Turn the dial to another station.');
			return;
		}
		const movedChirho =
			landingChirho.book_id_chirho !== this.stateChirho.book_id_chirho ||
			landingChirho.chapter_chirho !== this.stateChirho.chapter_chirho;
		this.emitChirho({
			...landingChirho,
			seconds_chirho: movedChirho ? 0 : (secondsChirho ?? 0),
			duration_chirho: 0,
			verse_chirho: null,
			phase_chirho: playChirho ? 'loading' : 'paused',
			message_chirho: movedChirho
				? 'This passage is unavailable here. Your original place is kept for the next station.'
				: recoveryChirho
					? 'The stream failed. Trying the next available chapter.'
					: ''
		});
		const resolvedChirho = resolveChapterPlaybackChirho(
			this.stationChirho,
			landingChirho.book_id_chirho,
			landingChirho.chapter_chirho
		);
		if (!resolvedChirho) {
			this.failChirho('This chapter is unavailable. Turn the dial to another station.');
			return;
		}
		this.pendingPositionChirho = movedChirho ? ZERO_POSITION_CHIRHO : positionChirho;
		this.pendingSecondsChirho = movedChirho ? 0 : secondsChirho;
		this.trackChirho = new ChapterTrackChirho(resolvedChirho);
		if (this.trackChirho.compositeChirho) {
			const durationChirho = this.trackChirho.durationChirho(0);
			const mappedChirho = mapPositionChirho(this.pendingPositionChirho, durationChirho, null);
			this.pendingSecondsChirho = Math.max(
				0,
				Math.min(durationChirho - 0.1, this.pendingSecondsChirho ?? mappedChirho.seconds_chirho)
			);
			this.emitChirho({
				duration_chirho: durationChirho,
				seconds_chirho: this.pendingSecondsChirho,
				position_mode_chirho: secondsChirho === null ? mappedChirho.mode_chirho : 'seconds'
			});
		}
		this.loadPartChirho(
			this.trackChirho.partAtChirho(this.pendingSecondsChirho ?? 0),
			playChirho,
			recoveryChirho,
			tuningChirho && recoveryChirho === 0 && !this.automaticChirho
		);
	}

	private loadPartChirho(
		indexChirho: number,
		playChirho: boolean,
		recoveryChirho = 0,
		tuningChirho = false
	): void {
		if (!this.trackChirho || this.disposedChirho) return;
		this.requestChirho += 1;
		this.clearTrackChirho();
		this.partIndexChirho = indexChirho;
		this.mediaDurationChirho = 0;
		this.seekFinishedChirho = false;
		this.hasPlayedChirho = false;
		this.expectedUrlChirho = this.trackChirho.urlChirho(indexChirho);
		this.requestedAtChirho = this.nowChirho();
		this.emitChirho({ phase_chirho: playChirho ? 'loading' : 'paused' });
		this.listenChirho('loadedmetadata', () => this.seekPendingChirho());
		this.listenChirho('loadeddata', () => this.seekPendingChirho());
		this.listenChirho('durationchange', () => this.seekPendingChirho());
		this.listenChirho('playing', () => {
			if (this.audioChirho.paused || this.audioChirho.readyState < 2) return;
			this.seekPendingChirho();
			if (this.audioChirho.paused || this.stateChirho.phase_chirho === 'error') return;
			this.seekFinishedChirho = true;
			this.automaticChirho = false;
			clearTimeout(this.timeoutChirho);
			this.optionsChirho.sounds_chirho.stopChirho();
			const elapsedChirho = Math.max(0, Math.round(this.nowChirho() - this.requestedAtChirho));
			this.emitChirho({
				phase_chirho: 'playing',
				first_sound_ms_chirho: this.stateChirho.first_sound_ms_chirho ?? elapsedChirho,
				switch_ms_chirho:
					this.switchingChirho && !this.hasPlayedChirho
						? elapsedChirho
						: this.stateChirho.switch_ms_chirho
			});
			this.hasPlayedChirho = true;
			this.switchingChirho = false;
			const originChirho = this.recoveryOriginChirho;
			this.recoveryOriginChirho = null;
			if (
				originChirho &&
				originChirho.book_id_chirho === this.followedPlaceChirho.book_id_chirho &&
				originChirho.chapter_chirho === this.followedPlaceChirho.chapter_chirho
			) {
				this.followedPlaceChirho = {
					station_id_chirho: this.stateChirho.station_id_chirho,
					language_code_chirho: this.stationChirho.language_code_chirho,
					book_id_chirho: this.stateChirho.book_id_chirho,
					chapter_chirho: this.stateChirho.chapter_chirho,
					...this.captureChirho()
				};
			}
			this.saveChirho();
		});
		this.listenChirho('timeupdate', () => {
			this.updateMediaPositionChirho();
			if (this.nowChirho() - this.lastSaveChirho >= 5000) this.saveChirho();
		});
		this.listenChirho('waiting', () => {
			if (this.stateChirho.phase_chirho === 'playing') {
				this.emitChirho({ phase_chirho: 'loading' });
				this.armTimeoutChirho();
			}
		});
		this.listenChirho('ended', () => this.finishPartChirho());
		this.listenChirho('pause', () => {
			if (
				this.audioChirho.paused &&
				!this.audioChirho.ended &&
				(this.stateChirho.phase_chirho === 'playing' || this.stateChirho.phase_chirho === 'loading')
			)
				this.pauseChirho();
		});
		this.listenChirho('error', () => {
			if (
				!this.trackChirho?.compositeChirho &&
				this.audioChirho.error?.code === 4 &&
				recoveryChirho < MAX_RECOVERY_CHIRHO
			) {
				this.updateFollowedPositionChirho();
				if (!this.recoveryOriginChirho)
					this.recoveryOriginChirho = {
						book_id_chirho: this.stateChirho.book_id_chirho,
						chapter_chirho: this.stateChirho.chapter_chirho,
						position_chirho: this.isFollowedPassageChirho()
							? { ...this.followedPlaceChirho }
							: this.captureChirho(),
						followed_place_chirho: { ...this.followedPlaceChirho }
					};
				const shouldPlayChirho =
					this.stateChirho.phase_chirho === 'playing' ||
					this.stateChirho.phase_chirho === 'loading';
				const nextChirho = nextOfferedChapterChirho(
					this.stationChirho,
					this.stateChirho.book_id_chirho,
					this.stateChirho.chapter_chirho
				);
				if (nextChirho) {
					this.emitChirho(nextChirho);
					this.beginTrackChirho(shouldPlayChirho, ZERO_POSITION_CHIRHO, 0, recoveryChirho + 1);
					return;
				}
			}
			this.failChirho('This stream could not play. Try again or turn the dial to another station.');
		});
		this.audioChirho.src = this.expectedUrlChirho;
		this.audioChirho.preload = playChirho ? 'auto' : 'metadata';
		this.audioChirho.load();
		if (playChirho) {
			if (tuningChirho) this.optionsChirho.sounds_chirho.startChirho();
			this.armTimeoutChirho();
			this.playAudioChirho();
		}
		this.prefetchTimingsChirho();
		this.saveChirho();
	}

	private finishPartChirho(): void {
		const nextIndexChirho = this.partIndexChirho + 1;
		if (!this.trackChirho || nextIndexChirho >= this.trackChirho.partCountChirho) {
			this.nextChirho(false);
			return;
		}
		const shouldPlayChirho =
			this.stateChirho.phase_chirho === 'playing' || this.stateChirho.phase_chirho === 'loading';
		const secondsChirho = this.trackChirho.startChirho(nextIndexChirho);
		this.emitChirho({ seconds_chirho: secondsChirho });
		this.updateFollowedPositionChirho();
		this.pendingPositionChirho = capturePositionChirho(
			secondsChirho,
			this.stateChirho.duration_chirho,
			null
		);
		this.pendingSecondsChirho = secondsChirho;
		this.loadPartChirho(nextIndexChirho, shouldPlayChirho);
	}

	private armTimeoutChirho(): void {
		clearTimeout(this.timeoutChirho);
		this.timeoutChirho = setTimeout(
			() => this.failChirho('This stream is taking too long. Try again or turn the dial.'),
			LOAD_TIMEOUT_MS_CHIRHO
		);
	}

	private playAudioChirho(): void {
		const requestChirho = this.requestChirho;
		const playAttemptChirho = ++this.playAttemptChirho;
		// Keep this synchronous with the tap. Reuse one media element for Safari and automatic chapters.
		void this.audioChirho.play().catch((errorChirho: unknown) => {
			if (
				playAttemptChirho !== this.playAttemptChirho ||
				requestChirho !== this.requestChirho ||
				this.disposedChirho ||
				this.stateChirho.phase_chirho === 'paused'
			)
				return;
			if (errorChirho instanceof Error && errorChirho.name === 'NotSupportedError') return; // The media error handler performs bounded recovery.
			if (errorChirho instanceof Error && errorChirho.name === 'NotAllowedError') {
				this.pauseChirho();
				this.emitChirho({ message_chirho: 'Press On to let your browser start the audio.' });
				this.optionsChirho.on_autoplay_blocked_chirho?.();
				return;
			}
			this.failChirho('Playback stopped. Turn the radio on to try again.');
		});
	}

	playChirho(automaticChirho = false, tuningChirho = true): void {
		if (
			this.disposedChirho ||
			this.stateChirho.phase_chirho === 'playing' ||
			this.stateChirho.phase_chirho === 'loading'
		)
			return;
		this.automaticChirho = automaticChirho;
		if (!this.expectedUrlChirho || this.stateChirho.phase_chirho === 'error') {
			this.switchingChirho = false;
			const followsChirho = this.isFollowedPassageChirho();
			this.beginTrackChirho(
				true,
				followsChirho ? this.followedPlaceChirho : ZERO_POSITION_CHIRHO,
				followsChirho
					? this.followedPlaceChirho.station_id_chirho === this.stateChirho.station_id_chirho
						? this.followedPlaceChirho.seconds_chirho
						: null
					: this.stateChirho.seconds_chirho,
				0,
				tuningChirho
			);
		} else {
			this.requestedAtChirho = this.nowChirho();
			this.emitChirho({ phase_chirho: 'loading', message_chirho: '' });
			this.armTimeoutChirho();
			this.playAudioChirho();
		}
	}

	pauseChirho(): void {
		if (this.disposedChirho) return;
		this.playAttemptChirho += 1;
		this.automaticChirho = false;
		clearTimeout(this.timeoutChirho);
		this.audioChirho.pause();
		this.updateMediaPositionChirho();
		this.optionsChirho.sounds_chirho.stopChirho();
		this.emitChirho({ phase_chirho: 'paused' });
		this.saveChirho();
	}

	toggleChirho(): void {
		if (this.stateChirho.phase_chirho === 'playing' || this.stateChirho.phase_chirho === 'loading')
			this.pauseChirho();
		else this.playChirho();
	}

	selectStationChirho(stationIdChirho: string): void {
		this.automaticChirho = false;
		const stationChirho = this.stationsByIdChirho.get(stationIdChirho);
		if (
			!stationChirho ||
			stationIdChirho === this.stateChirho.station_id_chirho ||
			this.disposedChirho
		)
			return;
		this.updateFollowedPositionChirho();
		this.recoveryOriginChirho = null;
		const positionChirho = { ...this.followedPlaceChirho };
		const phaseChirho = this.stateChirho.phase_chirho;
		this.selectedStationChirho = stationChirho;
		this.emitChirho({
			station_id_chirho: stationIdChirho,
			language_code_chirho: stationChirho.language_code_chirho,
			book_id_chirho: positionChirho.book_id_chirho,
			chapter_chirho: positionChirho.chapter_chirho,
			seconds_chirho: positionChirho.seconds_chirho
		});
		this.switchingChirho = true;
		if (phaseChirho === 'ready') {
			this.landReadyChirho();
			return;
		}
		this.beginTrackChirho(phaseChirho !== 'paused', positionChirho, null);
	}

	selectChapterChirho(bookIdChirho: string, chapterChirho: number, tuningChirho = true): void {
		const bookChirho = BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === bookIdChirho);
		if (
			!bookChirho ||
			!Number.isInteger(chapterChirho) ||
			chapterChirho < 1 ||
			chapterChirho > bookChirho.chapters_chirho ||
			this.disposedChirho
		)
			return;
		this.automaticChirho = false;
		this.recoveryOriginChirho = null;
		this.followedPlaceChirho = {
			station_id_chirho: this.stateChirho.station_id_chirho,
			language_code_chirho: this.stationChirho.language_code_chirho,
			book_id_chirho: bookIdChirho,
			chapter_chirho: chapterChirho,
			...ZERO_POSITION_CHIRHO
		};
		const phaseChirho = this.stateChirho.phase_chirho;
		this.switchingChirho = false;
		this.emitChirho({
			book_id_chirho: bookIdChirho,
			chapter_chirho: chapterChirho,
			seconds_chirho: 0
		});
		if (phaseChirho === 'ready') {
			this.landReadyChirho();
			return;
		}
		this.beginTrackChirho(phaseChirho !== 'paused', ZERO_POSITION_CHIRHO, 0, 0, tuningChirho);
	}

	nextChirho(tuningChirho = true): void {
		const nextChirho = nextOfferedChapterChirho(
			this.stationChirho,
			this.stateChirho.book_id_chirho,
			this.stateChirho.chapter_chirho
		);
		if (nextChirho)
			this.selectChapterChirho(nextChirho.book_id_chirho, nextChirho.chapter_chirho, tuningChirho);
	}

	previousChirho(tuningChirho = true): void {
		let indexChirho = BOOKS_CHIRHO.findIndex(
			(bookChirho) => bookChirho.id_chirho === this.stateChirho.book_id_chirho
		);
		let chapterChirho = this.stateChirho.chapter_chirho;
		for (let attemptChirho = 0; attemptChirho < 1189; attemptChirho += 1) {
			chapterChirho -= 1;
			if (chapterChirho < 1) {
				indexChirho = (indexChirho + BOOKS_CHIRHO.length - 1) % BOOKS_CHIRHO.length;
				chapterChirho = BOOKS_CHIRHO[indexChirho].chapters_chirho;
			}
			if (
				resolveChapterPlaybackChirho(
					this.stationChirho,
					BOOKS_CHIRHO[indexChirho].id_chirho,
					chapterChirho
				)
			) {
				this.selectChapterChirho(BOOKS_CHIRHO[indexChirho].id_chirho, chapterChirho, tuningChirho);
				return;
			}
		}
	}

	seekChirho(secondsChirho: number): void {
		const trackChirho = this.trackChirho;
		if (
			!trackChirho ||
			!Number.isFinite(secondsChirho) ||
			this.stateChirho.duration_chirho <= 0 ||
			(!trackChirho.compositeChirho && this.audioChirho.readyState < 1)
		)
			return;
		const targetChirho = Math.max(
			0,
			Math.min(this.stateChirho.duration_chirho - 0.1, secondsChirho)
		);
		const nextIndexChirho = trackChirho.partAtChirho(targetChirho);
		const shouldPlayChirho =
			this.stateChirho.phase_chirho === 'playing' || this.stateChirho.phase_chirho === 'loading';
		this.emitChirho({ seconds_chirho: targetChirho, position_mode_chirho: 'seconds' });
		this.recoveryOriginChirho = null;
		if (this.isFollowedPassageChirho())
			this.followedPlaceChirho = {
				station_id_chirho: this.stateChirho.station_id_chirho,
				language_code_chirho: this.stationChirho.language_code_chirho,
				book_id_chirho: this.stateChirho.book_id_chirho,
				chapter_chirho: this.stateChirho.chapter_chirho,
				...capturePositionChirho(
					targetChirho,
					this.stateChirho.duration_chirho,
					this.currentTimingsChirho()
				)
			};
		this.pendingPositionChirho = capturePositionChirho(
			targetChirho,
			this.stateChirho.duration_chirho,
			this.currentTimingsChirho()
		);
		this.pendingSecondsChirho = targetChirho;
		if (nextIndexChirho !== this.partIndexChirho) {
			this.loadPartChirho(nextIndexChirho, shouldPlayChirho);
			return;
		}
		this.seekFinishedChirho = false;
		this.seekPendingChirho();
		this.saveChirho();
	}

	setSoundsChirho(enabledChirho: boolean): void {
		this.optionsChirho.sounds_chirho.setEnabledChirho(enabledChirho);
		this.emitChirho({ sounds_enabled_chirho: enabledChirho });
		this.saveChirho();
	}

	private timingAddressChirho(stationChirho: StationChirho): string | undefined {
		const placeChirho =
			stationChirho.id_chirho === this.stateChirho.station_id_chirho
				? this.stateChirho
				: this.followedPlaceChirho;
		return resolveChapterChirho(
			stationChirho,
			placeChirho.book_id_chirho,
			placeChirho.chapter_chirho
		)?.timings_url_chirho;
	}

	// At most three small timing requests and six cached chapters; never prefetch Scripture audio.
	private prefetchTimingsChirho(): void {
		const currentStationChirho = this.stationChirho;
		const candidatesChirho = [
			currentStationChirho,
			...this.stationsChirho.filter(
				(stationChirho) =>
					stationChirho.id_chirho !== currentStationChirho.id_chirho &&
					stationChirho.has_timings_chirho
			)
		].slice(0, 3);
		const wantedChirho = new Set<string>();
		for (const stationChirho of candidatesChirho) {
			const urlChirho = this.timingAddressChirho(stationChirho);
			if (urlChirho) wantedChirho.add(urlChirho);
		}
		for (const [urlChirho, controllerChirho] of this.timingRequestsChirho) {
			if (!wantedChirho.has(urlChirho)) {
				controllerChirho.abort();
				this.timingRequestsChirho.delete(urlChirho);
			}
		}
		for (const stationChirho of candidatesChirho) {
			const urlChirho = this.timingAddressChirho(stationChirho);
			if (
				!urlChirho ||
				this.timingsChirho.has(urlChirho) ||
				this.timingRequestsChirho.has(urlChirho)
			)
				continue;
			const controllerChirho = new AbortController();
			this.timingRequestsChirho.set(urlChirho, controllerChirho);
			const timeoutChirho = setTimeout(() => controllerChirho.abort(), 2500);
			const fetchChirho = this.optionsChirho.fetch_chirho ?? fetch;
			void fetchChirho(urlChirho, {
				signal: controllerChirho.signal,
				credentials: 'omit',
				referrerPolicy: 'no-referrer'
			})
				.then(readBoundedTimingsChirho)
				.then((valueChirho) => parseVerseTimingsChirho(stationChirho, valueChirho))
				.then((timingsChirho) => {
					if (this.disposedChirho || controllerChirho.signal.aborted) return;
					if (this.timingsChirho.size >= 6)
						this.timingsChirho.delete(this.timingsChirho.keys().next().value!);
					this.timingsChirho.set(urlChirho, timingsChirho);
					if (!this.hasPlayedChirho && this.expectedUrlChirho) this.seekPendingChirho();
				})
				.catch(() => {
					/* Optional timings fall back to chapter fraction. */
				})
				.finally(() => {
					clearTimeout(timeoutChirho);
					if (this.timingRequestsChirho.get(urlChirho) === controllerChirho)
						this.timingRequestsChirho.delete(urlChirho);
				});
		}
	}

	saveChirho(): void {
		this.updateFollowedPositionChirho();
		const originChirho = this.recoveryOriginChirho;
		const preferencesChirho: PlayerPreferencesChirho = {
			station_id_chirho: this.stateChirho.station_id_chirho,
			language_code_chirho: this.stationChirho.language_code_chirho,
			...(this.stateChirho.dial_language_chirho
				? { dial_language_chirho: this.stateChirho.dial_language_chirho }
				: {}),
			book_id_chirho: originChirho?.book_id_chirho ?? this.stateChirho.book_id_chirho,
			chapter_chirho: originChirho?.chapter_chirho ?? this.stateChirho.chapter_chirho,
			seconds_chirho:
				originChirho?.position_chirho.seconds_chirho ?? this.stateChirho.seconds_chirho,
			sounds_enabled_chirho: this.stateChirho.sounds_enabled_chirho,
			followed_place_chirho: {
				...(originChirho?.followed_place_chirho ?? this.followedPlaceChirho)
			}
		};
		this.lastSaveChirho = this.nowChirho();
		try {
			if (!this.optionsChirho.storage_chirho) throw new Error('Storage unavailable');
			this.optionsChirho.storage_chirho.setItem(
				PREFERENCES_KEY_CHIRHO,
				JSON.stringify(preferencesChirho)
			);
		} catch {
			this.emitChirho({ storage_available_chirho: false });
		}
	}

	disposeChirho(): void {
		if (this.disposedChirho) return;
		this.saveChirho();
		this.disposedChirho = true;
		this.requestChirho += 1;
		this.clearTrackChirho();
		this.audioChirho.removeAttribute('src');
		this.audioChirho.load();
		this.optionsChirho.sounds_chirho.disposeChirho();
		for (const controllerChirho of this.timingRequestsChirho.values()) controllerChirho.abort();
		this.timingRequestsChirho.clear();
		this.timingsChirho.clear();
	}
}
