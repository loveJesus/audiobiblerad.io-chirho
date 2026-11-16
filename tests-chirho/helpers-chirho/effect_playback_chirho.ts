// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, type Page as PageChirho } from '@playwright/test';
import { mediaEventsChirho, type MediaEventChirho } from './media_chirho';

export async function effectSequenceChirho(pageChirho: PageChirho): Promise<number> {
	return (await mediaEventsChirho(pageChirho)).at(-1)?.sequence_chirho ?? 0;
}

export async function effectEventChirho(
	pageChirho: PageChirho,
	pathChirho: string,
	kindChirho: 'playing' | 'ended',
	afterChirho: number
): Promise<MediaEventChirho> {
	const matchesChirho = (eventChirho: MediaEventChirho): boolean =>
		eventChirho.sequence_chirho > afterChirho &&
		eventChirho.kind_chirho === kindChirho &&
		eventChirho.url_chirho.split('#')[0].endsWith(pathChirho) &&
		(kindChirho !== 'ended' || eventChirho.ended_chirho);
	await expect
		.poll(async () => (await mediaEventsChirho(pageChirho)).some(matchesChirho))
		.toBe(true);
	return (await mediaEventsChirho(pageChirho)).find(matchesChirho)!;
}
