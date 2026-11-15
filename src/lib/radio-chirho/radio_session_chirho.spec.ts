// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeAudioChirho } from '$lib/player-chirho/tests-chirho/player_fixture_chirho';
import {
	defaultPreferencesChirho,
	PREFERENCES_KEY_CHIRHO
} from '$lib/player-chirho/player_preferences_chirho';
import { RadioSessionChirho } from './radio_session_chirho';
import { POWER_KEY_CHIRHO, type AutoplayPolicyChirho } from './radio_types_chirho';

const sessionsChirho: RadioSessionChirho[] = [];
function setupSessionChirho(
	optionsChirho: {
		languages_chirho?: string[];
		policy_chirho?: AutoplayPolicyChirho;
		saved_chirho?: Map<string, string>;
		fetch_chirho?: typeof fetch;
	} = {}
) {
	const audioChirho = new FakeAudioChirho();
	const soundsChirho = {
		startChirho: vi.fn(),
		stopChirho: vi.fn(),
		setEnabledChirho: vi.fn(),
		disposeChirho: vi.fn()
	};
	const savedChirho = optionsChirho.saved_chirho ?? new Map<string, string>();
	const fetchChirho = vi.fn<typeof fetch>(
		optionsChirho.fetch_chirho ??
			(async (inputChirho) => {
				const pathChirho = new URL(String(inputChirho), 'https://radio.invalid').pathname;
				if (!pathChirho.startsWith('/catalogue-chirho/')) return new Response('', { status: 404 });
				try {
					return new Response(readFileSync(`static${pathChirho}`));
				} catch {
					return new Response('', { status: 404 });
				}
			})
	);
	const sessionChirho = new RadioSessionChirho({
		audio_chirho: audioChirho as unknown as HTMLAudioElement,
		sounds_chirho: soundsChirho,
		storage_chirho: {
			getItem: (keyChirho) => savedChirho.get(keyChirho) ?? null,
			setItem: (keyChirho, valueChirho) => {
				savedChirho.set(keyChirho, valueChirho);
			}
		},
		browser_languages_chirho: optionsChirho.languages_chirho ?? ['en-US'],
		autoplay_policy_chirho: () => optionsChirho.policy_chirho ?? 'disallowed',
		fetch_chirho: fetchChirho,
		on_change_chirho: vi.fn()
	});
	sessionsChirho.push(sessionChirho);
	return {
		session_chirho: sessionChirho,
		audio_chirho: audioChirho,
		sounds_chirho: soundsChirho,
		saved_chirho: savedChirho,
		fetch_chirho: fetchChirho
	};
}
afterEach(() => {
	for (const sessionChirho of sessionsChirho.splice(0)) sessionChirho.disposeChirho();
	vi.useRealTimers();
});

describe('radio startup and power', () => {
	it('respects the first browser preference ahead of English and keeps all narrations', async () => {
		const fixtureChirho = setupSessionChirho({ languages_chirho: ['es-MX', 'en-US'] });
		await fixtureChirho.session_chirho.startChirho();
		expect(fixtureChirho.session_chirho.stationChirho.language_code_chirho).toBe('es');
		expect(fixtureChirho.session_chirho.snapshotChirho.stations_chirho.length).toBeGreaterThan(0);
		expect(fixtureChirho.audio_chirho.play).not.toHaveBeenCalled();
		expect(fixtureChirho.session_chirho.snapshotChirho.needs_gesture_chirho).toBe(true);
	});
	it('a valid saved choice wins over locale and retains its passage', async () => {
		const fixtureChirho = setupSessionChirho({
			languages_chirho: ['es'],
			saved_chirho: new Map([
				[
					PREFERENCES_KEY_CHIRHO,
					JSON.stringify({ ...defaultPreferencesChirho(), chapter_chirho: 3, seconds_chirho: 25 })
				]
			])
		});
		await fixtureChirho.session_chirho.startChirho();
		expect(fixtureChirho.session_chirho.snapshotChirho.state_chirho).toMatchObject({
			station_id_chirho: 'helloao-bsb-hays',
			book_id_chirho: 'JHN',
			chapter_chirho: 3,
			seconds_chirho: 25
		});
	});
	it('tries allowed audible autoplay once without tuning and shows a gesture cue on rejection', async () => {
		const fixtureChirho = setupSessionChirho({ policy_chirho: 'unknown' });
		fixtureChirho.audio_chirho.play.mockRejectedValueOnce(
			new DOMException('Gesture needed', 'NotAllowedError')
		);
		await fixtureChirho.session_chirho.startChirho();
		await Promise.resolve();
		expect(fixtureChirho.audio_chirho.play).toHaveBeenCalledTimes(1);
		expect(fixtureChirho.sounds_chirho.startChirho).not.toHaveBeenCalled();
		expect(fixtureChirho.session_chirho.snapshotChirho).toMatchObject({
			needs_gesture_chirho: true,
			state_chirho: { phase_chirho: 'paused', chapter_chirho: 1 }
		});
		fixtureChirho.session_chirho.onChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		expect(fixtureChirho.session_chirho.snapshotChirho).toMatchObject({
			needs_gesture_chirho: false,
			state_chirho: { phase_chirho: 'playing' }
		});
	});
	it('explicit Off silences a loading attempt and prevents autoplay on reopening', async () => {
		const fixtureChirho = setupSessionChirho({ policy_chirho: 'allowed' });
		await fixtureChirho.session_chirho.startChirho();
		fixtureChirho.session_chirho.offChirho();
		expect(fixtureChirho.audio_chirho.paused).toBe(true);
		expect(fixtureChirho.saved_chirho.get(POWER_KEY_CHIRHO)).toBe('off');
		const reopenedChirho = setupSessionChirho({
			policy_chirho: 'allowed',
			saved_chirho: fixtureChirho.saved_chirho
		});
		await reopenedChirho.session_chirho.startChirho();
		expect(reopenedChirho.audio_chirho.play).not.toHaveBeenCalled();
		expect(reopenedChirho.session_chirho.snapshotChirho.needs_gesture_chirho).toBe(false);
	});
	it('Off remains remembered after sampling the final playing clock', async () => {
		const fixtureChirho = setupSessionChirho({ policy_chirho: 'allowed' });
		await fixtureChirho.session_chirho.startChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(8);
		fixtureChirho.session_chirho.offChirho();
		expect(fixtureChirho.saved_chirho.get(POWER_KEY_CHIRHO)).toBe('off');
		expect(JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!).seconds_chirho).toBe(
			8
		);
	});
	it('a naturally completed chapter continues without a new tuning cue', async () => {
		const fixtureChirho = setupSessionChirho();
		await fixtureChirho.session_chirho.startChirho();
		fixtureChirho.session_chirho.onChirho();
		fixtureChirho.audio_chirho.metadataChirho();
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.finishChirho();
		expect(fixtureChirho.session_chirho.snapshotChirho.state_chirho.chapter_chirho).toBe(2);
		expect(fixtureChirho.sounds_chirho.startChirho).toHaveBeenCalledTimes(1);
	});
	it('a failed saved dynamic station leaves its device memory intact', async () => {
		const rawChirho = JSON.stringify({
			...defaultPreferencesChirho(),
			station_id_chirho: 'davar-missing-station',
			language_code_chirho: 'hi',
			chapter_chirho: 3,
			seconds_chirho: 7
		});
		const fixtureChirho = setupSessionChirho({
			saved_chirho: new Map([[PREFERENCES_KEY_CHIRHO, rawChirho]]),
			fetch_chirho: async () => new Response('', { status: 503 })
		});
		await fixtureChirho.session_chirho.startChirho();
		expect(fixtureChirho.session_chirho.snapshotChirho.restore_failed_chirho).toBe(true);
		expect(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)).toBe(rawChirho);
	});
	it('a late first-run locale lookup cannot replace a newer explicit language', async () => {
		let releaseChirho!: () => void;
		const heldChirho = new Promise<void>((resolveChirho) => {
			releaseChirho = resolveChirho;
		});
		const fixtureChirho = setupSessionChirho({
			languages_chirho: ['es'],
			fetch_chirho: async (inputChirho) => {
				if (String(inputChirho).endsWith('languages_chirho.json')) {
					await heldChirho;
					return new Response(readFileSync('static/catalogue-chirho/languages_chirho.json'));
				}
				return new Response('', { status: 404 });
			}
		});
		const startupChirho = fixtureChirho.session_chirho.startChirho();
		await fixtureChirho.session_chirho.chooseLanguageChirho('en');
		expect(fixtureChirho.session_chirho.stationChirho.language_code_chirho).toBe('en');
		releaseChirho();
		await startupChirho;
		expect(fixtureChirho.session_chirho.stationChirho.language_code_chirho).toBe('en');
	});
});
