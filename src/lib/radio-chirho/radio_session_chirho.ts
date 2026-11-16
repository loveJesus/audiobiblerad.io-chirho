// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BOOKS_CHIRHO,
	STATIONS_CHIRHO,
	findStationChirho,
	resolveChapterPlaybackChirho,
	type StationChirho
} from '$lib/catalogue-chirho/catalogue_chirho';
import {
	LanguageLibraryChirho,
	mergeLanguagesChirho,
	stationsInLanguageChirho
} from '$lib/language-chirho/language_library_chirho';
import {
	initialStationChirho,
	matchBrowserLanguageChirho
} from '$lib/language-chirho/initial_station_chirho';
import { LanguageDialChirho } from '$lib/language-chirho/language_dial_chirho';
import { RadioPlayerChirho, type RadioStateChirho } from '$lib/player-chirho/radio_player_chirho';
import {
	defaultPreferencesChirho,
	readPreferencesChirho,
	savedLanguageCodeChirho,
	type PlayerPreferencesChirho,
	type PreferenceStorageChirho
} from '$lib/player-chirho/player_preferences_chirho';
import type { RadioSoundsChirho } from '$lib/sounds-chirho/radio_sounds_chirho';
import {
	POWER_KEY_CHIRHO,
	type AutoplayPolicyChirho,
	type RadioSessionViewChirho
} from './radio_types_chirho';

export function initialRadioViewChirho(): RadioSessionViewChirho {
	return {
		state_chirho: {
			...defaultPreferencesChirho(),
			phase_chirho: 'ready',
			duration_chirho: 0,
			verse_chirho: null,
			message_chirho: '',
			storage_available_chirho: true,
			first_sound_ms_chirho: null,
			switch_ms_chirho: null,
			position_mode_chirho: 'start'
		},
		stations_chirho: STATIONS_CHIRHO,
		languages_chirho: mergeLanguagesChirho([]),
		language_loading_chirho: '',
		language_message_chirho: '',
		restoring_chirho: false,
		restore_failed_chirho: false,
		needs_gesture_chirho: false,
		ready_chirho: false
	};
}

interface SessionOptionsChirho {
	storage_chirho: PreferenceStorageChirho | null;
	audio_chirho: HTMLAudioElement;
	sounds_chirho: RadioSoundsChirho;
	browser_languages_chirho: readonly string[];
	initial_language_chirho?: string;
	default_sounds_chirho?: boolean;
	autoplay_policy_chirho(): AutoplayPolicyChirho;
	on_change_chirho(viewChirho: RadioSessionViewChirho): void;
	fetch_chirho?: typeof fetch;
}

/** Browser orchestration for the tune-in and language workflows; never fetches source media. */
export class RadioSessionChirho {
	private viewChirho = initialRadioViewChirho();
	private readonly libraryChirho: LanguageLibraryChirho;
	private readonly rememberedChirho;
	private playerChirho: RadioPlayerChirho | undefined;
	private selectionChirho = 0;
	private disposedChirho = false;
	private powerPreferenceChirho: string | null = null;
	constructor(private readonly optionsChirho: SessionOptionsChirho) {
		this.libraryChirho = new LanguageLibraryChirho(optionsChirho.fetch_chirho);
		this.rememberedChirho = readPreferencesChirho(optionsChirho.storage_chirho);
		try {
			this.powerPreferenceChirho = optionsChirho.storage_chirho?.getItem(POWER_KEY_CHIRHO) ?? null;
		} catch {
			/* Optional device memory. */
		}
	}
	get snapshotChirho(): RadioSessionViewChirho {
		return this.viewChirho;
	}
	get stationChirho(): StationChirho {
		return this.playerChirho?.stationChirho ?? STATIONS_CHIRHO[0];
	}
	private emitChirho(patchChirho: Partial<RadioSessionViewChirho> = {}): void {
		if (this.disposedChirho) return;
		this.viewChirho = { ...this.viewChirho, ...patchChirho };
		this.optionsChirho.on_change_chirho(this.viewChirho);
	}
	private rememberPowerChirho(valueChirho: 'on' | 'off'): void {
		if (this.powerPreferenceChirho === valueChirho) return;
		this.powerPreferenceChirho = valueChirho;
		try {
			this.optionsChirho.storage_chirho?.setItem(POWER_KEY_CHIRHO, valueChirho);
		} catch {
			/* Playback is independent of storage. */
		}
	}
	private initializeChirho(
		preferencesChirho: PlayerPreferencesChirho,
		stationsChirho: readonly StationChirho[]
	): void {
		if (this.playerChirho || this.disposedChirho) return;
		this.emitChirho({ stations_chirho: stationsChirho });
		this.playerChirho = new RadioPlayerChirho({
			preferences_chirho: preferencesChirho,
			stations_chirho: stationsChirho,
			audio_chirho: this.optionsChirho.audio_chirho,
			sounds_chirho: this.optionsChirho.sounds_chirho,
			storage_chirho: this.optionsChirho.storage_chirho,
			fetch_chirho: this.optionsChirho.fetch_chirho,
			on_change_chirho: (stateChirho: RadioStateChirho) => {
				if (stateChirho.phase_chirho === 'playing') {
					this.rememberPowerChirho('on');
				}
				this.emitChirho({
					state_chirho: stateChirho,
					...(stateChirho.phase_chirho === 'playing' ? { needs_gesture_chirho: false } : {})
				});
			},
			on_autoplay_blocked_chirho: () => {
				this.emitChirho({ needs_gesture_chirho: true });
			}
		});
		this.emitChirho({ ready_chirho: true, restoring_chirho: false, restore_failed_chirho: false });
		if (this.powerPreferenceChirho !== 'off') {
			const policyChirho = this.optionsChirho.autoplay_policy_chirho();
			if (policyChirho === 'disallowed' || policyChirho === 'allowed-muted')
				this.emitChirho({ needs_gesture_chirho: true });
			else {
				this.playerChirho.playChirho(true);
			}
		}
	}
	async refreshLanguagesChirho(): Promise<void> {
		try {
			this.emitChirho({ languages_chirho: await this.libraryChirho.loadListChirho() });
		} catch {
			if (!this.disposedChirho)
				this.emitChirho({
					language_message_chirho:
						'More languages could not load. Open the language label to retry.'
				});
		}
	}
	async startChirho(): Promise<void> {
		const preferredLanguagesChirho = this.optionsChirho.initial_language_chirho
			? [this.optionsChirho.initial_language_chirho]
			: this.optionsChirho.browser_languages_chirho;
		const rememberedLanguageChirho =
			findStationChirho(this.rememberedChirho.preferences_chirho.station_id_chirho)
				?.language_code_chirho ?? this.rememberedChirho.preferences_chirho.language_code_chirho;
		if (
			this.rememberedChirho.remembered_chirho &&
			(!this.optionsChirho.initial_language_chirho ||
				this.optionsChirho.initial_language_chirho === rememberedLanguageChirho)
		) {
			const rememberedChirho = this.rememberedChirho.preferences_chirho;
			if (findStationChirho(rememberedChirho.station_id_chirho)) {
				const codeChirho = rememberedChirho.dial_language_chirho;
				this.emitChirho({ dial_language_chirho: codeChirho });
				this.initializeChirho(
					rememberedChirho,
					codeChirho ? stationsInLanguageChirho(codeChirho, []) : STATIONS_CHIRHO
				);
				if (codeChirho) void this.chooseLanguageChirho(codeChirho);
			} else await this.restoreChirho();
		} else {
			const requestChirho = ++this.selectionChirho;
			let codeChirho = matchBrowserLanguageChirho(
				preferredLanguagesChirho.slice(0, 1),
				STATIONS_CHIRHO.map((stationChirho) => stationChirho.language_code_chirho)
			);
			let stationsChirho: readonly StationChirho[] = stationsInLanguageChirho(
				codeChirho ?? 'en',
				[]
			);
			if (!codeChirho) {
				let timerChirho: ReturnType<typeof setTimeout> | undefined;
				let initialActiveChirho = true;
				try {
					await Promise.race([
						(async () => {
							const languagesChirho = await this.libraryChirho.loadListChirho();
							if (
								!initialActiveChirho ||
								requestChirho !== this.selectionChirho ||
								this.disposedChirho
							)
								return;
							this.emitChirho({ languages_chirho: languagesChirho });
							const matchChirho = matchBrowserLanguageChirho(
								preferredLanguagesChirho,
								languagesChirho.map((languageChirho) => languageChirho.code_chirho)
							);
							if (!matchChirho) return;
							const loadedChirho = await this.libraryChirho.loadStationsChirho(matchChirho);
							if (
								!initialActiveChirho ||
								requestChirho !== this.selectionChirho ||
								this.disposedChirho
							)
								return;
							codeChirho = matchChirho;
							stationsChirho = loadedChirho;
						})(),
						new Promise<void>((_resolveChirho, rejectChirho) => {
							timerChirho = setTimeout(
								() => rejectChirho(new Error('First language lookup timed out')),
								1500
							);
						})
					]);
				} catch {
					if (requestChirho === this.selectionChirho) this.libraryChirho.cancelSelectionChirho();
					codeChirho =
						matchBrowserLanguageChirho(
							preferredLanguagesChirho,
							this.viewChirho.languages_chirho
								.filter(
									(languageChirho) =>
										stationsInLanguageChirho(languageChirho.code_chirho, []).length
								)
								.map((languageChirho) => languageChirho.code_chirho)
						) ?? 'en';
					stationsChirho = stationsInLanguageChirho(codeChirho, []);
				} finally {
					initialActiveChirho = false;
					clearTimeout(timerChirho);
				}
			}
			if (this.disposedChirho || requestChirho !== this.selectionChirho) return;
			const initialChirho =
				initialStationChirho(stationsChirho, codeChirho ?? 'en') ?? STATIONS_CHIRHO[0];
			this.emitChirho({ dial_language_chirho: initialChirho.language_code_chirho });
			this.initializeChirho(
				{
					...defaultPreferencesChirho(),
					sounds_enabled_chirho: this.optionsChirho.default_sounds_chirho ?? true,
					station_id_chirho: initialChirho.id_chirho,
					language_code_chirho: initialChirho.language_code_chirho,
					dial_language_chirho: initialChirho.language_code_chirho
				},
				stationsChirho
			);
		}
		void this.refreshLanguagesChirho();
	}
	async restoreChirho(): Promise<void> {
		const requestChirho = ++this.selectionChirho;
		this.emitChirho({
			restoring_chirho: true,
			restore_failed_chirho: false,
			language_loading_chirho: '',
			language_message_chirho: ''
		});
		try {
			const preferencesChirho = this.rememberedChirho.preferences_chirho;
			const codeChirho = preferencesChirho.language_code_chirho!;
			const stationsChirho = await this.libraryChirho.loadStationsChirho(codeChirho);
			if (this.disposedChirho || requestChirho !== this.selectionChirho) return;
			if (
				!stationsChirho.some(
					(stationChirho) => stationChirho.id_chirho === preferencesChirho.station_id_chirho
				)
			)
				throw new Error('Remembered station unavailable');
			this.emitChirho({ dial_language_chirho: codeChirho });
			this.initializeChirho(
				{ ...preferencesChirho, dial_language_chirho: codeChirho },
				stationsChirho
			);
		} catch {
			if (requestChirho === this.selectionChirho) this.emitChirho({ restore_failed_chirho: true });
		} finally {
			if (requestChirho === this.selectionChirho) this.emitChirho({ restoring_chirho: false });
		}
	}
	async chooseLanguageChirho(codeChirho: string, stationIndexChirho?: number): Promise<void> {
		if (!savedLanguageCodeChirho(codeChirho)) return;
		const requestChirho = ++this.selectionChirho;
		this.emitChirho({ language_loading_chirho: codeChirho, language_message_chirho: '' });
		try {
			const stationsChirho = await this.libraryChirho.loadStationsChirho(codeChirho);
			if (this.disposedChirho || requestChirho !== this.selectionChirho) return;
			const selectedChirho =
				stationIndexChirho === undefined
					? initialStationChirho(stationsChirho, codeChirho)!
					: stationsChirho[Math.max(0, Math.min(stationsChirho.length - 1, stationIndexChirho))];
			this.emitChirho({
				stations_chirho: stationsChirho,
				dial_language_chirho: codeChirho,
				restoring_chirho: false,
				restore_failed_chirho: false
			});
			if (!this.playerChirho)
				this.initializeChirho(
					{
						...this.rememberedChirho.preferences_chirho,
						station_id_chirho: selectedChirho.id_chirho,
						language_code_chirho: codeChirho,
						dial_language_chirho: codeChirho
					},
					stationsChirho
				);
			this.playerChirho!.setStationsChirho(stationsChirho, codeChirho);
			if (
				stationIndexChirho !== undefined ||
				!stationsChirho.some(
					(stationChirho) => stationChirho.id_chirho === this.playerChirho!.stationChirho.id_chirho
				)
			)
				this.playerChirho!.selectStationChirho(selectedChirho.id_chirho);
		} catch {
			if (requestChirho === this.selectionChirho)
				this.emitChirho({
					language_message_chirho:
						'These stations could not load. Choose the language again to retry. Your place is kept.',
					...(!this.playerChirho ? { restoring_chirho: false, restore_failed_chirho: true } : {})
				});
		} finally {
			if (requestChirho === this.selectionChirho) this.emitChirho({ language_loading_chirho: '' });
		}
	}
	chooseStationChirho(idChirho: string): void {
		if (
			!this.viewChirho.stations_chirho.some((stationChirho) => stationChirho.id_chirho === idChirho)
		)
			return;
		this.selectionChirho += 1;
		this.libraryChirho.cancelSelectionChirho();
		this.emitChirho({ language_loading_chirho: '', language_message_chirho: '' });
		if (!this.playerChirho) {
			const selectedChirho = this.viewChirho.stations_chirho.find(
				(stationChirho) => stationChirho.id_chirho === idChirho
			)!;
			this.initializeChirho(
				{
					...this.rememberedChirho.preferences_chirho,
					station_id_chirho: idChirho,
					language_code_chirho: selectedChirho.language_code_chirho
				},
				this.viewChirho.stations_chirho
			);
		}
		this.playerChirho?.selectStationChirho(idChirho);
	}
	chooseBuiltinsChirho(): void {
		this.selectionChirho += 1;
		this.libraryChirho.cancelSelectionChirho();
		this.emitChirho({
			stations_chirho: STATIONS_CHIRHO,
			dial_language_chirho: undefined,
			restoring_chirho: false,
			restore_failed_chirho: false,
			language_loading_chirho: '',
			language_message_chirho: ''
		});
		if (!this.playerChirho)
			this.initializeChirho(
				{
					...this.rememberedChirho.preferences_chirho,
					station_id_chirho: STATIONS_CHIRHO[0].id_chirho,
					language_code_chirho: STATIONS_CHIRHO[0].language_code_chirho,
					dial_language_chirho: undefined
				},
				STATIONS_CHIRHO
			);
		this.playerChirho!.setStationsChirho(STATIONS_CHIRHO);
		if (!findStationChirho(this.playerChirho!.stationChirho.id_chirho))
			this.playerChirho!.selectStationChirho(STATIONS_CHIRHO[0].id_chirho);
	}
	chooseDialChirho(indexChirho: number): void {
		const targetChirho = new LanguageDialChirho(this.viewChirho.languages_chirho).targetChirho(
			indexChirho
		);
		if (!targetChirho) return;
		const localChirho = this.viewChirho.stations_chirho.filter(
			(stationChirho) => stationChirho.language_code_chirho === targetChirho.code_chirho
		);
		if (localChirho[targetChirho.station_index_chirho])
			this.chooseStationChirho(localChirho[targetChirho.station_index_chirho].id_chirho);
		else
			void this.chooseLanguageChirho(targetChirho.code_chirho, targetChirho.station_index_chirho);
	}
	chooseBookChirho(bookIdChirho: string): void {
		const bookChirho = BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === bookIdChirho);
		if (!bookChirho) return;
		const chapterChirho = Array.from(
			{ length: bookChirho.chapters_chirho },
			(_unusedChirho, indexChirho) => indexChirho + 1
		).find((chapterChirho) =>
			resolveChapterPlaybackChirho(this.stationChirho, bookIdChirho, chapterChirho)
		);
		if (chapterChirho) this.playerChirho?.selectChapterChirho(bookIdChirho, chapterChirho);
	}
	chooseChapterChirho(chapterChirho: number): void {
		this.playerChirho?.selectChapterChirho(
			this.viewChirho.state_chirho.book_id_chirho,
			chapterChirho
		);
	}
	feedbackChirho(kindChirho: 'click' | 'knob'): void {
		if (this.disposedChirho) return;
		if (kindChirho === 'knob') this.optionsChirho.sounds_chirho.knobChirho?.();
		else this.optionsChirho.sounds_chirho.clickChirho?.();
	}
	powerChirho(): void {
		if (!this.playerChirho) return;
		this.emitChirho({ needs_gesture_chirho: false });
		if (['playing', 'loading'].includes(this.playerChirho.snapshotChirho.phase_chirho))
			this.offChirho();
		else this.onChirho();
	}
	offChirho(feedbackChirho = true): void {
		this.emitChirho({ needs_gesture_chirho: false });
		this.playerChirho?.pauseChirho();
		// pause samples the playing clock first; persist Off after those intermediate snapshots.
		this.rememberPowerChirho('off');
		if (feedbackChirho) this.feedbackChirho('click');
		else this.optionsChirho.sounds_chirho.silenceChirho?.();
	}
	onChirho(feedbackChirho = true): void {
		this.rememberPowerChirho('on');
		this.emitChirho({ needs_gesture_chirho: false });
		this.playerChirho?.playChirho(false, feedbackChirho);
		if (feedbackChirho) this.feedbackChirho('click');
	}
	seekChirho(secondsChirho: number): void {
		this.playerChirho?.seekChirho(secondsChirho);
	}
	nextChirho(feedbackChirho = true): void {
		this.playerChirho?.nextChirho(feedbackChirho);
	}
	previousChirho(feedbackChirho = true): void {
		this.playerChirho?.previousChirho(feedbackChirho);
	}
	setSoundsChirho(valueChirho: boolean): void {
		this.playerChirho?.setSoundsChirho(valueChirho);
		if (valueChirho) this.feedbackChirho('click');
	}
	saveChirho(): void {
		this.playerChirho?.saveChirho();
	}
	disposeChirho(): void {
		this.disposedChirho = true;
		this.selectionChirho += 1;
		this.libraryChirho.disposeChirho();
		this.playerChirho?.disposeChirho();
		if (!this.playerChirho) this.optionsChirho.sounds_chirho.disposeChirho();
	}
}
