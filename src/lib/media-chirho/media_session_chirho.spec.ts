// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it, vi } from 'vitest';
import { findBookChirho, STATIONS_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';
import { initialRadioViewChirho } from '$lib/radio-chirho/radio_session_chirho';
import type { RadioStateChirho } from '$lib/player-chirho/radio_player_chirho';
import { createMediaSessionChirho, type MediaSessionPortChirho } from './media_session_chirho';

function viewChirho(patchChirho: Partial<RadioStateChirho> = {}) {
	const initialChirho = initialRadioViewChirho();
	return {
		...initialChirho,
		ready_chirho: true,
		state_chirho: {
			...initialChirho.state_chirho,
			phase_chirho: 'playing' as const,
			chapter_chirho: 3,
			duration_chirho: 120,
			seconds_chirho: 25,
			...patchChirho
		}
	};
}

function fixtureChirho() {
	const handlersChirho = new Map<MediaSessionAction, MediaSessionActionHandler | null>();
	const positionsChirho: (MediaPositionState | undefined)[] = [];
	const portChirho: MediaSessionPortChirho = {
		metadata: null,
		playbackState: 'none',
		setActionHandler: vi.fn((actionChirho, handlerChirho) => {
			handlersChirho.set(actionChirho, handlerChirho);
		}),
		setPositionState: vi.fn((stateChirho) => {
			positionsChirho.push(stateChirho);
		})
	};
	const controlsChirho = {
		onChirho: vi.fn(),
		offChirho: vi.fn(),
		nextChirho: vi.fn(),
		previousChirho: vi.fn(),
		seekChirho: vi.fn()
	};
	const metadataChirho = vi.fn((valueChirho: MediaMetadataInit) => valueChirho as MediaMetadata);
	const bridgeChirho = createMediaSessionChirho(controlsChirho, {
		session_chirho: portChirho,
		metadata_chirho: metadataChirho
	});
	const invokeChirho = (
		actionChirho: MediaSessionAction,
		detailsChirho: { seekTime?: number; seekOffset?: number } = {}
	) => {
		const handlerChirho = handlersChirho.get(actionChirho);
		expect(handlerChirho).toBeTypeOf('function');
		handlerChirho?.({ action: actionChirho, ...detailsChirho });
	};
	return {
		bridgeChirho,
		controlsChirho,
		portChirho,
		handlersChirho,
		positionsChirho,
		metadataChirho,
		invokeChirho
	};
}

describe('browser media controls', () => {
	it('leaves an unopened, restoring or blocked radio out of the platform controls', () => {
		const fixtureValueChirho = fixtureChirho();
		for (const phaseChirho of ['ready', 'loading', 'paused', 'error'] as const)
			fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ phase_chirho: phaseChirho }));
		fixtureValueChirho.bridgeChirho.disposeChirho();
		expect(fixtureValueChirho.portChirho.setActionHandler).not.toHaveBeenCalled();
		expect(fixtureValueChirho.metadataChirho).not.toHaveBeenCalled();
		expect(fixtureValueChirho.positionsChirho).toEqual([]);
		expect(fixtureValueChirho.portChirho.playbackState).toBe('none');
	});

	it('publishes the playing chapter and reuses its metadata while position advances', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: 26 }));
		expect(fixtureValueChirho.portChirho.metadata).toMatchObject({
			title: `${findBookChirho('JHN')!.name_chirho} 3`,
			artist: STATIONS_CHIRHO[0].voice_chirho,
			album: `${STATIONS_CHIRHO[0].version_chirho} · ${STATIONS_CHIRHO[0].language_english_chirho}`
		});
		expect(fixtureValueChirho.metadataChirho).toHaveBeenCalledTimes(1);
		expect(fixtureValueChirho.handlersChirho.size).toBe(8);
		expect(fixtureValueChirho.portChirho.playbackState).toBe('playing');
		expect(fixtureValueChirho.positionsChirho.at(-1)).toEqual({
			duration: 120,
			position: 26,
			playbackRate: 1
		});
	});

	it('forwards power and chapter controls through the same session', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		for (const actionChirho of ['play', 'pause', 'stop', 'nexttrack', 'previoustrack'] as const)
			fixtureValueChirho.invokeChirho(actionChirho);
		expect(fixtureValueChirho.controlsChirho.onChirho).toHaveBeenCalledTimes(1);
		expect(fixtureValueChirho.controlsChirho.offChirho).toHaveBeenCalledTimes(2);
		expect(fixtureValueChirho.controlsChirho.nextChirho).toHaveBeenCalledTimes(1);
		expect(fixtureValueChirho.controlsChirho.previousChirho).toHaveBeenCalledTimes(1);
	});

	it('restores the playing state when an optional effect changes the browser state behind the adapter', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		fixtureValueChirho.portChirho.playbackState = 'paused';
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: 26 }));
		expect(fixtureValueChirho.portChirho.playbackState).toBe('playing');
	});

	it('uses the latest whole-chapter position for relative and absolute seeks without turning a paused radio on', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(
			viewChirho({ duration_chirho: 900, seconds_chirho: 450 })
		);
		fixtureValueChirho.invokeChirho('seekforward');
		expect(fixtureValueChirho.controlsChirho.seekChirho).toHaveBeenLastCalledWith(460);
		fixtureValueChirho.bridgeChirho.updateChirho(
			viewChirho({ duration_chirho: 900, seconds_chirho: 600, phase_chirho: 'paused' })
		);
		fixtureValueChirho.invokeChirho('seekbackward', { seekOffset: 30 });
		expect(fixtureValueChirho.controlsChirho.seekChirho).toHaveBeenLastCalledWith(570);
		fixtureValueChirho.invokeChirho('seekto', { seekTime: 725 });
		expect(fixtureValueChirho.controlsChirho.seekChirho).toHaveBeenLastCalledWith(725);
		expect(fixtureValueChirho.portChirho.playbackState).toBe('paused');
		expect(fixtureValueChirho.positionsChirho.at(-1)).toEqual({
			duration: 900,
			position: 600,
			playbackRate: 1
		});
		expect(fixtureValueChirho.controlsChirho.onChirho).not.toHaveBeenCalled();
	});

	it('bounds seek commands and rejects malformed values', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		fixtureValueChirho.invokeChirho('seekto', { seekTime: -20 });
		expect(fixtureValueChirho.controlsChirho.seekChirho).toHaveBeenLastCalledWith(0);
		fixtureValueChirho.invokeChirho('seekto', { seekTime: 200 });
		expect(fixtureValueChirho.controlsChirho.seekChirho).toHaveBeenLastCalledWith(120);
		fixtureValueChirho.controlsChirho.seekChirho.mockClear();
		for (const targetChirho of [NaN, Infinity, -Infinity])
			fixtureValueChirho.invokeChirho('seekto', { seekTime: targetChirho });
		fixtureValueChirho.invokeChirho('seekto');
		for (const offsetChirho of [0, -1, NaN, Infinity])
			fixtureValueChirho.invokeChirho('seekforward', { seekOffset: offsetChirho });
		expect(fixtureValueChirho.controlsChirho.seekChirho).not.toHaveBeenCalled();
	});

	it('clears stale chapter position while loading or failing, then publishes the new timeline', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		fixtureValueChirho.bridgeChirho.updateChirho(
			viewChirho({ phase_chirho: 'loading', chapter_chirho: 4, duration_chirho: 0 })
		);
		expect(fixtureValueChirho.positionsChirho.at(-1)).toBeUndefined();
		expect(fixtureValueChirho.portChirho.metadata?.title).toBe(
			`${findBookChirho('JHN')!.name_chirho} 4`
		);
		fixtureValueChirho.invokeChirho('seekforward');
		expect(fixtureValueChirho.controlsChirho.seekChirho).not.toHaveBeenCalled();
		fixtureValueChirho.bridgeChirho.updateChirho(
			viewChirho({ chapter_chirho: 4, duration_chirho: 200, seconds_chirho: 5 })
		);
		expect(fixtureValueChirho.positionsChirho.at(-1)).toEqual({
			duration: 200,
			position: 5,
			playbackRate: 1
		});
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ phase_chirho: 'error' }));
		expect(fixtureValueChirho.positionsChirho.at(-1)).toBeUndefined();
		expect(fixtureValueChirho.portChirho.playbackState).toBe('paused');
	});

	it('never sends a non-finite or out-of-range chapter position to the browser', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: -10 }));
		expect(fixtureValueChirho.positionsChirho.at(-1)?.position).toBe(0);
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: 500 }));
		expect(fixtureValueChirho.positionsChirho.at(-1)?.position).toBe(120);
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ duration_chirho: Infinity }));
		expect(fixtureValueChirho.positionsChirho.at(-1)).toBeUndefined();
		const countChirho = fixtureValueChirho.positionsChirho.length;
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: NaN }));
		expect(fixtureValueChirho.positionsChirho).toHaveLength(countChirho);
	});

	it('keeps other controls working when one action and position publishing are unsupported', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.portChirho.setActionHandler = (actionChirho, handlerChirho) => {
			if (actionChirho === 'seekto') throw new Error('Unsupported action');
			fixtureValueChirho.handlersChirho.set(actionChirho, handlerChirho);
		};
		fixtureValueChirho.portChirho.setPositionState = vi.fn(() => {
			throw new Error('Unsupported position');
		});
		expect(() => fixtureValueChirho.bridgeChirho.updateChirho(viewChirho())).not.toThrow();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho({ seconds_chirho: 26 }));
		fixtureValueChirho.invokeChirho('pause');
		expect(fixtureValueChirho.controlsChirho.offChirho).toHaveBeenCalledTimes(1);
		expect(fixtureValueChirho.portChirho.setPositionState).toHaveBeenCalledTimes(1);
	});

	it('does not require metadata or a Media Session API to keep the radio usable', () => {
		const fixtureValueChirho = fixtureChirho();
		const noMetadataChirho = createMediaSessionChirho(fixtureValueChirho.controlsChirho, {
			session_chirho: fixtureValueChirho.portChirho
		});
		noMetadataChirho.updateChirho(viewChirho());
		fixtureValueChirho.invokeChirho('play');
		expect(fixtureValueChirho.controlsChirho.onChirho).toHaveBeenCalledTimes(1);
		const missingChirho = createMediaSessionChirho(fixtureValueChirho.controlsChirho, {
			session_chirho: null
		});
		expect(() => {
			missingChirho.updateChirho(viewChirho());
			missingChirho.disposeChirho();
		}).not.toThrow();
	});

	it('isolates metadata and playback-state failures from actions and disposal', () => {
		const fixtureValueChirho = fixtureChirho();
		Object.defineProperty(fixtureValueChirho.portChirho, 'playbackState', {
			set() {
				throw new Error('State unavailable');
			}
		});
		fixtureValueChirho.metadataChirho.mockImplementation(() => {
			throw new Error('Metadata unavailable');
		});
		expect(() => fixtureValueChirho.bridgeChirho.updateChirho(viewChirho())).not.toThrow();
		fixtureValueChirho.invokeChirho('stop');
		expect(fixtureValueChirho.controlsChirho.offChirho).toHaveBeenCalledTimes(1);
		expect(() => fixtureValueChirho.bridgeChirho.disposeChirho()).not.toThrow();
	});

	it('retires callbacks, platform position and metadata without acting on audio after disposal', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		const latePlayChirho = fixtureValueChirho.handlersChirho.get('play')!;
		fixtureValueChirho.bridgeChirho.disposeChirho();
		fixtureValueChirho.bridgeChirho.disposeChirho();
		fixtureValueChirho.bridgeChirho.updateChirho(viewChirho());
		latePlayChirho({ action: 'play' });
		expect(fixtureValueChirho.portChirho.metadata).toBeNull();
		expect(fixtureValueChirho.portChirho.playbackState).toBe('none');
		expect(fixtureValueChirho.positionsChirho.at(-1)).toBeUndefined();
		expect(
			[...fixtureValueChirho.handlersChirho.values()].every(
				(handlerChirho) => handlerChirho === null
			)
		).toBe(true);
		expect(fixtureValueChirho.controlsChirho.onChirho).not.toHaveBeenCalled();
	});
});
