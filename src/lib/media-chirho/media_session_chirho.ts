// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { BOOKS_CHIRHO, type StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';
import type { RadioSessionViewChirho } from '$lib/radio-chirho/radio_types_chirho';

export interface MediaControlsChirho {
	onChirho(): void;
	offChirho(): void;
	nextChirho(): void;
	previousChirho(): void;
	seekChirho(secondsChirho: number): void;
}

export interface MediaSessionPortChirho {
	metadata: MediaMetadata | null;
	playbackState: MediaSessionPlaybackState;
	setActionHandler(
		actionChirho: MediaSessionAction,
		handlerChirho: MediaSessionActionHandler | null
	): void;
	setPositionState?(stateChirho?: MediaPositionState): void;
}

export interface MediaEnvironmentChirho {
	session_chirho: MediaSessionPortChirho | null;
	metadata_chirho?: (valueChirho: MediaMetadataInit) => MediaMetadata;
}

const BOOK_NAMES_CHIRHO = new Map<string, string>(
	BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, bookChirho.name_chirho])
);
const SEEK_SECONDS_CHIRHO = 10;

function browserMediaEnvironmentChirho(): MediaEnvironmentChirho {
	try {
		return {
			session_chirho: typeof navigator === 'undefined' ? null : (navigator.mediaSession ?? null),
			metadata_chirho:
				typeof MediaMetadata === 'undefined'
					? undefined
					: (valueChirho) => new MediaMetadata(valueChirho)
		};
	} catch {
		return { session_chirho: null };
	}
}

/** Browser controls follow workflows-chirho/experience-chirho/media_controls_workflow_chirho.md.
 * The radio owns audio; this adapter only publishes its chapter timeline and forwards actions.
 */
export function createMediaSessionChirho(
	controlsChirho: MediaControlsChirho,
	environmentChirho = browserMediaEnvironmentChirho()
): { updateChirho(viewChirho: RadioSessionViewChirho): void; disposeChirho(): void } {
	const portChirho = environmentChirho.session_chirho;
	let viewChirho: RadioSessionViewChirho | null = null;
	let acquiredChirho = false;
	let disposedChirho = false;
	let metadataKeyChirho = '';
	let playbackAvailableChirho = true;
	let hasPositionChirho = false;
	let positionAvailableChirho = typeof portChirho?.setPositionState === 'function';
	let stationListChirho: readonly StationChirho[] | undefined;
	const stationsChirho = new Map<string, StationChirho>();
	const registeredChirho: MediaSessionAction[] = [];
	const clearPositionChirho = (): void => {
		if (!portChirho || !hasPositionChirho || !positionAvailableChirho) return;
		hasPositionChirho = false;
		try {
			portChirho.setPositionState?.();
		} catch {
			positionAvailableChirho = false;
		}
	};
	const seekChirho = (targetChirho: number): void => {
		const stateChirho = viewChirho?.state_chirho;
		if (
			!stateChirho ||
			!['playing', 'paused'].includes(stateChirho.phase_chirho) ||
			!Number.isFinite(stateChirho.duration_chirho) ||
			stateChirho.duration_chirho <= 0 ||
			!Number.isFinite(targetChirho)
		)
			return;
		controlsChirho.seekChirho(Math.max(0, Math.min(stateChirho.duration_chirho, targetChirho)));
	};
	const relativeSeekChirho = (
		detailsChirho: MediaSessionActionDetails,
		directionChirho: number
	): void => {
		const offsetChirho = detailsChirho.seekOffset ?? SEEK_SECONDS_CHIRHO;
		const secondsChirho = viewChirho?.state_chirho.seconds_chirho;
		if (
			!Number.isFinite(offsetChirho) ||
			offsetChirho <= 0 ||
			typeof secondsChirho !== 'number' ||
			!Number.isFinite(secondsChirho)
		)
			return;
		seekChirho(secondsChirho + directionChirho * offsetChirho);
	};
	const actionsChirho: readonly [MediaSessionAction, MediaSessionActionHandler][] = [
		['play', () => controlsChirho.onChirho()],
		['pause', () => controlsChirho.offChirho()],
		['stop', () => controlsChirho.offChirho()],
		['nexttrack', () => controlsChirho.nextChirho()],
		['previoustrack', () => controlsChirho.previousChirho()],
		[
			'seekto',
			(detailsChirho) => {
				if (typeof detailsChirho.seekTime === 'number') seekChirho(detailsChirho.seekTime);
			}
		],
		['seekbackward', (detailsChirho) => relativeSeekChirho(detailsChirho, -1)],
		['seekforward', (detailsChirho) => relativeSeekChirho(detailsChirho, 1)]
	];
	return {
		updateChirho(nextChirho) {
			if (disposedChirho || !portChirho) return;
			viewChirho = nextChirho;
			const stateChirho = nextChirho.state_chirho;
			// A closed widget or a blocked first On must not publish a phantom listening session.
			if (!acquiredChirho) {
				if (stateChirho.phase_chirho !== 'playing') return;
				acquiredChirho = true;
				for (const [actionChirho, handlerChirho] of actionsChirho) {
					try {
						portChirho.setActionHandler(actionChirho, (detailsChirho) => {
							if (!disposedChirho) handlerChirho(detailsChirho);
						});
						registeredChirho.push(actionChirho);
					} catch {
						/* Unsupported actions cannot prevent the other controls. */
					}
				}
			}
			const keyChirho = `${stateChirho.station_id_chirho}/${stateChirho.book_id_chirho}/${stateChirho.chapter_chirho}`;
			if (keyChirho !== metadataKeyChirho) {
				clearPositionChirho();
				metadataKeyChirho = keyChirho;
				if (stationListChirho !== nextChirho.stations_chirho) {
					stationListChirho = nextChirho.stations_chirho;
					stationsChirho.clear();
					for (const stationChirho of stationListChirho)
						stationsChirho.set(stationChirho.id_chirho, stationChirho);
				}
				const stationChirho = stationsChirho.get(stateChirho.station_id_chirho);
				try {
					if (environmentChirho.metadata_chirho)
						portChirho.metadata = environmentChirho.metadata_chirho({
							title: `${BOOK_NAMES_CHIRHO.get(stateChirho.book_id_chirho) ?? stateChirho.book_id_chirho} ${stateChirho.chapter_chirho}`,
							artist:
								stationChirho?.voice_chirho ||
								stationChirho?.source_name_chirho ||
								'Audio Bible Radio',
							album: stationChirho
								? `${stationChirho.version_chirho} · ${stationChirho.language_english_chirho}`
								: 'Audio Bible Radio'
						});
				} catch {
					/* Metadata is optional even where media actions exist. */
				}
			}
			const playbackChirho = ['playing', 'loading'].includes(stateChirho.phase_chirho)
				? 'playing'
				: 'paused';
			if (playbackAvailableChirho) {
				try {
					// WebKit can change this when a different media element, such as an effect, ends.
					if (portChirho.playbackState !== playbackChirho)
						portChirho.playbackState = playbackChirho;
				} catch {
					playbackAvailableChirho = false;
					/* Optional platform display; the radio still owns playback. */
				}
			}
			if (
				!['playing', 'paused'].includes(stateChirho.phase_chirho) ||
				!Number.isFinite(stateChirho.duration_chirho) ||
				stateChirho.duration_chirho <= 0 ||
				!Number.isFinite(stateChirho.seconds_chirho)
			) {
				clearPositionChirho();
				return;
			}
			if (positionAvailableChirho) {
				try {
					portChirho.setPositionState?.({
						duration: stateChirho.duration_chirho,
						position: Math.max(
							0,
							Math.min(stateChirho.duration_chirho, stateChirho.seconds_chirho)
						),
						playbackRate: 1
					});
					hasPositionChirho = true;
				} catch {
					positionAvailableChirho = false;
				}
			}
		},
		disposeChirho() {
			if (disposedChirho) return;
			disposedChirho = true;
			viewChirho = null;
			stationsChirho.clear();
			stationListChirho = undefined;
			if (!portChirho || !acquiredChirho) return;
			for (const actionChirho of registeredChirho) {
				try {
					portChirho.setActionHandler(actionChirho, null);
				} catch {
					/* Teardown must finish even with a partially implemented API. */
				}
			}
			clearPositionChirho();
			try {
				portChirho.metadata = null;
			} catch {
				/* Optional platform metadata. */
			}
			try {
				portChirho.playbackState = 'none';
			} catch {
				/* Optional platform state. */
			}
		}
	};
}
