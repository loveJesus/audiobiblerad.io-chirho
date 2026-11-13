// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, describe, expect, it, vi } from 'vitest';
import { STATIONS_CHIRHO, type StationChirho } from '$lib/catalogue-chirho/catalogue_chirho';
import { PREFERENCES_KEY_CHIRHO } from '../player_preferences_chirho';
import { disposePlayersChirho, setupChirho } from './player_fixture_chirho';

afterEach(disposePlayersChirho);

const PART_ONE_CHIRHO = 'https://audio.example/recording/part_a.mp3';
const PART_TWO_CHIRHO = 'https://audio.example/recording/part_b.mp3';
const stationsChirho: readonly StationChirho[] = [
	{
		...STATIONS_CHIRHO[0],
		coverage_chirho: {
			JOL: [
				[1, 1],
				[3, 3]
			]
		},
		chapter_count_chirho: 2,
		has_timings_chirho: false,
		timings_chirho: undefined,
		locator_chirho: {
			kind_chirho: 'pattern',
			template_chirho: 'https://audio.example/recording/{book_upper_chirho}_{chapter_chirho}.mp3'
		},
		composite_chapters_chirho: {
			JOL: {
				'2': {
					parts_chirho: [
						{ url_chirho: PART_ONE_CHIRHO, duration_seconds_chirho: 10 },
						{ url_chirho: PART_TWO_CHIRHO, duration_seconds_chirho: 20 }
					],
					measured_on_chirho: '2026-11-13'
				}
			}
		}
	},
	{
		...STATIONS_CHIRHO[1],
		coverage_chirho: { JOL: [[1, 3]] },
		chapter_count_chirho: 3,
		has_timings_chirho: false,
		timings_chirho: undefined,
		locator_chirho: {
			kind_chirho: 'pattern',
			template_chirho: 'https://audio.example/ordinary/{book_upper_chirho}_{chapter_chirho}.mp3'
		}
	}
];

function startChirho() {
	const fixtureChirho = setupChirho(null, false, false, stationsChirho);
	fixtureChirho.player_chirho.selectChapterChirho('JOL', 2);
	fixtureChirho.player_chirho.playChirho();
	fixtureChirho.audio_chirho.metadataChirho(10);
	fixtureChirho.audio_chirho.playingChirho();
	return fixtureChirho;
}

describe('one chapter across files', () => {
	it('continues once at a part boundary, keeping chapter and total, without another tuning sound', () => {
		const fixtureChirho = setupChirho(null, false, false, stationsChirho);
		const listenersChirho = vi.spyOn(fixtureChirho.audio_chirho, 'addEventListener');
		fixtureChirho.player_chirho.selectChapterChirho('JOL', 2);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(10);
		fixtureChirho.audio_chirho.playingChirho();
		const staleEndedChirho = listenersChirho.mock.calls.find(
			([nameChirho]) => nameChirho === 'ended'
		)![1] as () => void;
		fixtureChirho.audio_chirho.finishChirho();
		staleEndedChirho();
		expect(fixtureChirho.audio_chirho.src).toBe(PART_TWO_CHIRHO);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			chapter_chirho: 2,
			seconds_chirho: 10,
			duration_chirho: 30
		});
		fixtureChirho.audio_chirho.metadataChirho(20);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.audio_chirho.positionChirho(5);
		expect(fixtureChirho.player_chirho.snapshotChirho.seconds_chirho).toBe(15);
		expect(fixtureChirho.sounds_chirho.startChirho).toHaveBeenCalledTimes(1);
		fixtureChirho.audio_chirho.finishChirho();
		staleEndedChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho.chapter_chirho).toBe(3);
		expect(fixtureChirho.audio_chirho.src).toContain('JOL_3.mp3');
	});

	it('seeks both ways across a boundary and preserves pause intent', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.player_chirho.seekChirho(25);
		expect(fixtureChirho.audio_chirho.src).toBe(PART_TWO_CHIRHO);
		fixtureChirho.audio_chirho.metadataChirho(20);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(15);
		fixtureChirho.player_chirho.seekChirho(4);
		expect(fixtureChirho.audio_chirho.src).toBe(PART_ONE_CHIRHO);
		fixtureChirho.audio_chirho.metadataChirho(10);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(4);
		fixtureChirho.player_chirho.pauseChirho();
		const playsChirho = fixtureChirho.audio_chirho.play.mock.calls.length;
		fixtureChirho.player_chirho.seekChirho(20);
		fixtureChirho.audio_chirho.metadataChirho(20);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(10);
		expect(fixtureChirho.audio_chirho.play.mock.calls.length).toBe(playsChirho);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('paused');
	});

	it('reopens directly in the later file from a whole-chapter saved position', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.player_chirho.seekChirho(25);
		fixtureChirho.audio_chirho.metadataChirho(20);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.player_chirho.pauseChirho();
		const savedChirho = fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!;
		expect(JSON.parse(savedChirho).seconds_chirho).toBe(25);
		const reopenedChirho = setupChirho(savedChirho, false, false, stationsChirho);
		reopenedChirho.player_chirho.playChirho();
		expect(reopenedChirho.audio_chirho.src).toBe(PART_TWO_CHIRHO);
		reopenedChirho.audio_chirho.metadataChirho(20);
		expect(reopenedChirho.audio_chirho.currentTime).toBe(15);
		expect(reopenedChirho.player_chirho.snapshotChirho).toMatchObject({
			seconds_chirho: 25,
			duration_chirho: 30
		});
	});

	it('carries chapter fraction to an ordinary recording and back into the correct part', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.player_chirho.seekChirho(15);
		fixtureChirho.audio_chirho.metadataChirho(20);
		fixtureChirho.audio_chirho.playingChirho();
		fixtureChirho.player_chirho.selectStationChirho(stationsChirho[1].id_chirho);
		fixtureChirho.audio_chirho.metadataChirho(90);
		fixtureChirho.audio_chirho.playingChirho();
		expect(fixtureChirho.audio_chirho.currentTime).toBe(45);
		fixtureChirho.player_chirho.selectStationChirho(stationsChirho[0].id_chirho);
		expect(fixtureChirho.audio_chirho.src).toBe(PART_TWO_CHIRHO);
		fixtureChirho.audio_chirho.metadataChirho(20);
		expect(fixtureChirho.audio_chirho.currentTime).toBe(5);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			seconds_chirho: 15,
			position_mode_chirho: 'fraction'
		});
	});

	it('keeps the chapter and boundary position when its later file cannot load, including repeated retry', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.audio_chirho.finishChirho();
		for (let attemptChirho = 0; attemptChirho < 2; attemptChirho += 1) {
			fixtureChirho.audio_chirho.failedChirho();
			expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
				phase_chirho: 'error',
				chapter_chirho: 2,
				seconds_chirho: 10
			});
			expect(JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!)).toMatchObject({
				chapter_chirho: 2,
				seconds_chirho: 10,
				followed_place_chirho: { chapter_chirho: 2, seconds_chirho: 10 }
			});
			fixtureChirho.player_chirho.playChirho();
			expect(fixtureChirho.audio_chirho.src).toBe(PART_TWO_CHIRHO);
		}
	});

	it('respects a pause during continuation and fences events from the previous file after tuning away', () => {
		const fixtureChirho = setupChirho(null, false, false, stationsChirho);
		const listenersChirho = vi.spyOn(fixtureChirho.audio_chirho, 'addEventListener');
		fixtureChirho.player_chirho.selectChapterChirho('JOL', 2);
		fixtureChirho.player_chirho.playChirho();
		fixtureChirho.audio_chirho.metadataChirho(10);
		fixtureChirho.audio_chirho.playingChirho();
		const staleErrorChirho = listenersChirho.mock.calls.find(
			([nameChirho]) => nameChirho === 'error'
		)![1] as () => void;
		fixtureChirho.audio_chirho.finishChirho();
		fixtureChirho.player_chirho.pauseChirho();
		fixtureChirho.audio_chirho.metadataChirho(20);
		expect(fixtureChirho.audio_chirho.paused).toBe(true);
		expect(fixtureChirho.player_chirho.snapshotChirho.phase_chirho).toBe('paused');
		fixtureChirho.player_chirho.selectStationChirho(stationsChirho[1].id_chirho);
		staleErrorChirho();
		fixtureChirho.audio_chirho.metadataChirho(90);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			phase_chirho: 'paused',
			chapter_chirho: 2,
			seconds_chirho: 30
		});
	});

	it.each([NaN, Infinity, 14])(
		'stops on invalid or substantially changed metadata (%s), preserving saved progress',
		(durationChirho) => {
			const fixtureChirho = setupChirho(null, false, false, stationsChirho);
			fixtureChirho.player_chirho.selectChapterChirho('JOL', 2);
			fixtureChirho.player_chirho.playChirho();
			fixtureChirho.audio_chirho.metadataChirho(durationChirho);
			expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
				phase_chirho: 'error',
				chapter_chirho: 2,
				seconds_chirho: 0
			});
			expect(fixtureChirho.audio_chirho.src).toBe('');
			expect(
				JSON.parse(fixtureChirho.saved_chirho.get(PREFERENCES_KEY_CHIRHO)!).chapter_chirho
			).toBe(2);
		}
	);

	it('maps small metadata drift inside fixed measured chapter boundaries', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.audio_chirho.metadataChirho(10.5);
		fixtureChirho.audio_chirho.positionChirho(5.25);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			seconds_chirho: 5,
			duration_chirho: 30
		});
		fixtureChirho.player_chirho.seekChirho(8);
		expect(fixtureChirho.audio_chirho.currentTime).toBeCloseTo(8.4);
		fixtureChirho.audio_chirho.finishChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho.seconds_chirho).toBe(10);
	});

	it('keeps playing through a later VBR duration refinement, without moving the next part boundary', () => {
		const fixtureChirho = startChirho();
		fixtureChirho.audio_chirho.duration = 14;
		fixtureChirho.audio_chirho.dispatchEvent(new Event('durationchange'));
		fixtureChirho.audio_chirho.positionChirho(7);
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			phase_chirho: 'playing',
			seconds_chirho: 5,
			duration_chirho: 30
		});
		fixtureChirho.audio_chirho.duration = Infinity;
		fixtureChirho.audio_chirho.dispatchEvent(new Event('durationchange'));
		fixtureChirho.audio_chirho.positionChirho(7);
		expect(fixtureChirho.player_chirho.snapshotChirho.seconds_chirho).toBe(5);
		fixtureChirho.audio_chirho.finishChirho();
		expect(fixtureChirho.player_chirho.snapshotChirho).toMatchObject({
			chapter_chirho: 2,
			seconds_chirho: 10
		});
	});
});
