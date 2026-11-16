// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { Page as PageChirho } from '@playwright/test';

/** Record successful registration against the real platform API. Invoking these callbacks proves
 * the radio's handler wiring, not a hardware key, physical lock screen or background entitlement.
 */
export async function observeMediaSessionChirho(pageChirho: PageChirho): Promise<void> {
	await pageChirho.addInitScript(() => {
		const handlersChirho = new Map<MediaSessionAction, MediaSessionActionHandler | null>();
		const positionsChirho: (MediaPositionState | null)[] = [];
		Object.assign(window, {
			mediaHandlersChirho: handlersChirho,
			mediaPositionsChirho: positionsChirho
		});
		const portChirho = navigator.mediaSession;
		if (!portChirho) return;
		const registerChirho = portChirho.setActionHandler.bind(portChirho);
		portChirho.setActionHandler = (actionChirho, handlerChirho) => {
			registerChirho(actionChirho, handlerChirho);
			handlersChirho.set(actionChirho, handlerChirho);
		};
		if (typeof portChirho.setPositionState === 'function') {
			const publishChirho = portChirho.setPositionState.bind(portChirho);
			portChirho.setPositionState = (valueChirho) => {
				publishChirho(valueChirho);
				if (positionsChirho.length >= 64) positionsChirho.shift();
				positionsChirho.push(valueChirho?.duration === undefined ? null : { ...valueChirho });
			};
		}
	});
}

export async function mediaSessionStateChirho(pageChirho: PageChirho) {
	return pageChirho.evaluate(() => {
		const stateChirho = window as unknown as {
			mediaHandlersChirho: Map<MediaSessionAction, MediaSessionActionHandler | null>;
			mediaPositionsChirho: (MediaPositionState | null)[];
		};
		return {
			metadata_chirho: navigator.mediaSession?.metadata && {
				title_chirho: navigator.mediaSession.metadata.title,
				artist_chirho: navigator.mediaSession.metadata.artist,
				album_chirho: navigator.mediaSession.metadata.album
			},
			playback_chirho: navigator.mediaSession?.playbackState,
			actions_chirho: [...stateChirho.mediaHandlersChirho]
				.filter(([, handlerChirho]) => handlerChirho !== null)
				.map(([actionChirho]) => actionChirho),
			position_chirho: stateChirho.mediaPositionsChirho.at(-1) ?? null
		};
	});
}

export async function invokeMediaActionChirho(
	pageChirho: PageChirho,
	actionChirho: MediaSessionAction,
	detailsChirho: { seekTime?: number; seekOffset?: number } = {}
): Promise<void> {
	await pageChirho.evaluate(
		({ action_chirho: actionChirho, details_chirho: detailsChirho }) => {
			const handlerChirho = (
				window as unknown as {
					mediaHandlersChirho: Map<MediaSessionAction, MediaSessionActionHandler | null>;
				}
			).mediaHandlersChirho.get(actionChirho);
			if (!handlerChirho) throw new Error(`No registered ${actionChirho} handler`);
			handlerChirho({ action: actionChirho, ...detailsChirho });
		},
		{ action_chirho: actionChirho, details_chirho: detailsChirho }
	);
}
