// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type * as ThreeChirho from 'three';
import {
	BOOKS_CHIRHO,
	STATIONS_CHIRHO,
	resolveChapterPlaybackChirho,
	type StationChirho
} from '$lib/catalogue-chirho/catalogue_chirho';
import { initialStationChirho } from '$lib/language-chirho/initial_station_chirho';
import { LanguageDialChirho } from '$lib/language-chirho/language_dial_chirho';
import type { RadioSessionChirho } from '$lib/radio-chirho/radio_session_chirho';
import type { RadioSessionViewChirho } from '$lib/radio-chirho/radio_types_chirho';
import type { DialOptionChirho } from '$lib/controls-chirho/dial_math_chirho';
import { ProjectedControlsChirho } from './projected_controls_chirho';
import { KnobControlChirho } from './knob_control_chirho';

function elementChirho<KChirho extends keyof HTMLElementTagNameMap>(
	tagChirho: KChirho,
	classChirho = ''
): HTMLElementTagNameMap[KChirho] {
	const resultChirho = document.createElement(tagChirho);
	resultChirho.className = classChirho;
	return resultChirho;
}
function optionsChirho(
	selectChirho: HTMLSelectElement,
	valuesChirho: readonly { value_chirho: string; label_chirho: string }[],
	chosenChirho: string
): void {
	const signatureChirho = JSON.stringify(valuesChirho);
	if (selectChirho.dataset.signatureChirho !== signatureChirho) {
		selectChirho.replaceChildren(
			...valuesChirho.map((valueChirho) => {
				const optionChirho = elementChirho('option');
				optionChirho.value = valueChirho.value_chirho;
				optionChirho.textContent = valueChirho.label_chirho;
				return optionChirho;
			})
		);
		selectChirho.dataset.signatureChirho = signatureChirho;
	}
	selectChirho.value = chosenChirho;
}
const numberedChirho = (countChirho: number): DialOptionChirho[] =>
	Array.from({ length: countChirho }, (_unusedChirho, indexChirho) => ({
		value_chirho: indexChirho,
		label_chirho: String(indexChirho)
	}));
const POSITION_OPTIONS_CHIRHO = numberedChirho(101);
const timeChirho = (secondsChirho: number): string =>
	`${Math.floor(Math.max(0, secondsChirho) / 60)}:${String(Math.floor(Math.max(0, secondsChirho)) % 60).padStart(2, '0')}`;

/** A DOM view of the existing session; it never creates or disposes audio or device memory. */
export class RoomControlsChirho {
	readonly projection_chirho: ProjectedControlsChirho;
	private readonly languageChirho = elementChirho('select');
	private readonly versionChirho = elementChirho('select');
	private readonly narrationChirho = elementChirho('select');
	private readonly stationDialChirho = elementChirho('input');
	private readonly bookChirho = elementChirho('select');
	private readonly chapterChirho = elementChirho('select');
	private readonly powerChirho = elementChirho('button', 'room-power-chirho');
	private readonly soundsChirho = elementChirho('button', 'room-sounds-chirho');
	private readonly pressChirho = elementChirho('button', 'room-press-chirho');
	private readonly statusChirho = elementChirho('span', 'room-status-chirho');
	private readonly clockChirho = elementChirho('span');
	private readonly creditChirho = elementChirho('div', 'room-paper-chirho');
	private readonly accessibleCreditChirho = elementChirho('div', 'room-credit-readable-chirho');
	private readonly dialogChirho = elementChirho('dialog', 'room-about-chirho');
	private readonly sessionChirho: RadioSessionChirho;
	private readonly bookKnobChirho: KnobControlChirho;
	private readonly chapterKnobChirho: KnobControlChirho;
	private readonly positionKnobChirho: KnobControlChirho;
	private readonly stationKnobChirho: KnobControlChirho;
	private stationOptionsChirho: DialOptionChirho[] = [];
	private bookPreviewChirho: number | null = null;
	private chapterPreviewChirho: number | null = null;
	private stationPreviewChirho: number | null = null;
	private actualDialIndexChirho = 0;
	private viewChirho: RadioSessionViewChirho;
	private stationChirho: StationChirho = STATIONS_CHIRHO[0];
	private offeredBooksChirho: DialOptionChirho[] = [];
	private offeredChaptersChirho: DialOptionChirho[] = [];
	private coverageKeyChirho = '';
	private creditKeyChirho = '';
	private choiceKeyChirho = '';
	private choiceStationsChirho: RadioSessionViewChirho['stations_chirho'] | undefined;
	private choiceLanguagesChirho: RadioSessionViewChirho['languages_chirho'] | undefined;
	constructor(
		assetChirho: ThreeChirho.Object3D,
		hostChirho: HTMLElement,
		sessionChirho: RadioSessionChirho,
		viewChirho: RadioSessionViewChirho
	) {
		this.sessionChirho = sessionChirho;
		this.viewChirho = viewChirho;
		this.projection_chirho = new ProjectedControlsChirho(assetChirho, hostChirho);
		try {
			const feedbackChirho = () => this.sessionChirho.feedbackChirho('knob');
			this.bookKnobChirho = new KnobControlChirho(
				'Book',
				(orderChirho) =>
					this.sessionChirho.chooseBookChirho(BOOKS_CHIRHO[orderChirho - 1].id_chirho),
				feedbackChirho,
				(valueChirho) => {
					this.bookPreviewChirho = valueChirho;
					this.paintPreviewsChirho();
				}
			);
			this.chapterKnobChirho = new KnobControlChirho(
				'Chapter',
				(chapterChirho) => this.sessionChirho.chooseChapterChirho(chapterChirho),
				feedbackChirho,
				(valueChirho) => {
					this.chapterPreviewChirho = valueChirho;
					this.paintPreviewsChirho();
				}
			);
			this.positionKnobChirho = new KnobControlChirho(
				'Chapter position',
				(percentChirho) =>
					this.sessionChirho.seekChirho(
						(percentChirho / 100) * this.viewChirho.state_chirho.duration_chirho
					),
				feedbackChirho
			);
			this.stationKnobChirho = new KnobControlChirho(
				'Station tuning',
				(indexChirho) => this.sessionChirho.chooseDialChirho(indexChirho),
				feedbackChirho,
				(valueChirho) => {
					this.stationPreviewChirho = valueChirho;
					this.paintPreviewsChirho();
				},
				360
			);
			this.stationKnobChirho.element_chirho.classList.add('room-knob-large-chirho');
			const screenChirho = elementChirho('div', 'room-screen-chirho');
			for (const [labelChirho, selectChirho] of [
				['Language', this.languageChirho],
				['Version', this.versionChirho],
				['Narration', this.narrationChirho]
			] as const) {
				const rowChirho = elementChirho('label');
				const captionChirho = elementChirho('span');
				captionChirho.textContent = labelChirho;
				selectChirho.setAttribute('aria-label', labelChirho);
				for (const childChirho of [captionChirho, selectChirho]) rowChirho.appendChild(childChirho);
				screenChirho.appendChild(rowChirho);
			}
			const tuningChirho = elementChirho('label', 'room-station-chirho');
			tuningChirho.textContent = 'STATION ';
			this.stationDialChirho.type = 'range';
			this.stationDialChirho.min = '0';
			this.stationDialChirho.step = '1';
			this.stationDialChirho.setAttribute('aria-label', 'Station dial');
			for (const childChirho of [this.stationDialChirho, this.statusChirho, this.clockChirho])
				tuningChirho.appendChild(childChirho);
			screenChirho.appendChild(tuningChirho);
			this.projection_chirho.addChirho('live_language_display_chirho', screenChirho);
			this.projection_chirho.addChirho('live_book_knob_chirho', this.bookKnobChirho.element_chirho);
			this.projection_chirho.addChirho(
				'live_chapter_knob_chirho',
				this.chapterKnobChirho.element_chirho
			);
			this.projection_chirho.addChirho(
				!assetChirho || assetChirho.getObjectByName('live_position_chirho')
					? 'live_position_chirho'
					: 'live_volume_chirho',
				this.positionKnobChirho.element_chirho
			);
			this.projection_chirho.addChirho(
				'live_station_knob_chirho',
				this.stationKnobChirho.element_chirho
			);
			this.bookChirho.setAttribute('aria-label', 'Book label');
			this.chapterChirho.setAttribute('aria-label', 'Chapter label');
			this.projection_chirho.addChirho('live_book_display_chirho', this.bookChirho);
			this.projection_chirho.addChirho('live_chapter_display_chirho', this.chapterChirho);
			this.powerChirho.type = this.soundsChirho.type = this.pressChirho.type = 'button';
			this.powerChirho.setAttribute('aria-label', 'Radio power');
			this.soundsChirho.setAttribute('aria-label', 'Radio sounds');
			this.pressChirho.textContent = 'PRESS HERE ↓';
			this.pressChirho.setAttribute('aria-label', 'Start listening');
			const powerMountChirho = this.projection_chirho.addChirho(
				'live_on_off_chirho',
				this.powerChirho
			);
			powerMountChirho.appendChild(this.pressChirho);
			this.projection_chirho.addChirho('live_sound_switch_chirho', this.soundsChirho);
			this.projection_chirho.addChirho('live_notepad_credit_chirho', this.creditChirho);
			hostChirho.appendChild(this.accessibleCreditChirho);
			this.languageChirho.addEventListener(
				'focus',
				() => void this.sessionChirho.refreshLanguagesChirho()
			);
			this.languageChirho.addEventListener('change', () => {
				this.sessionChirho.feedbackChirho('click');
				void this.sessionChirho.chooseLanguageChirho(this.languageChirho.value);
			});
			this.versionChirho.addEventListener('change', () => {
				this.sessionChirho.feedbackChirho('click');
				const selectedChirho = initialStationChirho(
					this.viewChirho.stations_chirho.filter(
						(stationChirho) =>
							stationChirho.language_code_chirho === this.stationChirho.language_code_chirho &&
							stationChirho.version_chirho === this.versionChirho.value
					),
					this.stationChirho.language_code_chirho
				);
				if (selectedChirho) this.sessionChirho.chooseStationChirho(selectedChirho.id_chirho);
			});
			this.narrationChirho.addEventListener('change', () => {
				this.sessionChirho.feedbackChirho('click');
				this.sessionChirho.chooseStationChirho(this.narrationChirho.value);
			});
			this.stationDialChirho.addEventListener('input', () => {
				this.stationPreviewChirho = Number(this.stationDialChirho.value);
				feedbackChirho();
				this.paintPreviewsChirho();
			});
			this.stationDialChirho.addEventListener('change', () => {
				const chosenChirho = this.stationPreviewChirho ?? Number(this.stationDialChirho.value);
				this.stationPreviewChirho = null;
				this.sessionChirho.chooseDialChirho(chosenChirho);
				this.paintPreviewsChirho();
			});
			this.stationDialChirho.addEventListener('pointercancel', () => {
				this.stationPreviewChirho = null;
				this.paintPreviewsChirho();
			});
			this.bookChirho.addEventListener('change', () => {
				this.sessionChirho.feedbackChirho('click');
				this.sessionChirho.chooseBookChirho(this.bookChirho.value);
			});
			this.chapterChirho.addEventListener('change', () => {
				this.sessionChirho.feedbackChirho('click');
				this.sessionChirho.chooseChapterChirho(Number(this.chapterChirho.value));
			});
			this.powerChirho.addEventListener('click', () => this.sessionChirho.powerChirho());
			this.pressChirho.addEventListener('click', () => this.sessionChirho.onChirho());
			this.soundsChirho.addEventListener('click', () =>
				this.sessionChirho.setSoundsChirho(!this.viewChirho.state_chirho.sounds_enabled_chirho)
			);
			const aboutChirho = elementChirho('button', 'room-about-button-chirho');
			aboutChirho.type = 'button';
			aboutChirho.textContent = '?';
			aboutChirho.setAttribute('aria-label', 'About and recording information');
			this.accessibleCreditChirho.appendChild(aboutChirho);
			const closeChirho = elementChirho('button');
			closeChirho.type = 'button';
			closeChirho.textContent = 'Close';
			closeChirho.addEventListener('click', () => this.dialogChirho.close());
			this.dialogChirho.appendChild(closeChirho);
			document.body.appendChild(this.dialogChirho);
			aboutChirho.addEventListener('click', () => this.dialogChirho.showModal());
			this.dialogChirho.addEventListener('close', () => aboutChirho.focus());
			this.renderChirho();
			this.setActiveChirho(false);
		} catch (errorChirho) {
			this.disposeChirho();
			throw errorChirho;
		}
	}
	setActiveChirho(activeChirho: boolean): void {
		this.accessibleCreditChirho.hidden = !activeChirho;
	}
	updateChirho(viewChirho: RadioSessionViewChirho): void {
		this.viewChirho = viewChirho;
		this.renderChirho();
	}
	private voicesChirho(): readonly StationChirho[] {
		return this.viewChirho.stations_chirho.filter(
			(stationChirho) =>
				stationChirho.language_code_chirho === this.stationChirho.language_code_chirho &&
				stationChirho.version_chirho === this.stationChirho.version_chirho
		);
	}
	private renderChirho(): void {
		const viewChirho = this.viewChirho,
			stateChirho = viewChirho.state_chirho;
		this.stationChirho =
			viewChirho.stations_chirho.find(
				(stationChirho) => stationChirho.id_chirho === stateChirho.station_id_chirho
			) ?? STATIONS_CHIRHO[0];
		const stationChirho = this.stationChirho,
			bookChirho =
				BOOKS_CHIRHO.find((bookChirho) => bookChirho.id_chirho === stateChirho.book_id_chirho) ??
				BOOKS_CHIRHO[0];
		const choiceKeyChirho = `${stationChirho.id_chirho}/${bookChirho.id_chirho}/${stateChirho.chapter_chirho}/${viewChirho.ready_chirho}`;
		if (
			this.choiceKeyChirho !== choiceKeyChirho ||
			this.choiceStationsChirho !== viewChirho.stations_chirho ||
			this.choiceLanguagesChirho !== viewChirho.languages_chirho
		) {
			this.choiceKeyChirho = choiceKeyChirho;
			this.choiceStationsChirho = viewChirho.stations_chirho;
			this.choiceLanguagesChirho = viewChirho.languages_chirho;
			const languageStationsChirho = viewChirho.stations_chirho.filter(
				(entryChirho) => entryChirho.language_code_chirho === stationChirho.language_code_chirho
			);
			const dialChirho = new LanguageDialChirho(viewChirho.languages_chirho);
			optionsChirho(
				this.languageChirho,
				viewChirho.languages_chirho.map((entryChirho) => ({
					value_chirho: entryChirho.code_chirho,
					label_chirho: entryChirho.name_chirho
				})),
				stationChirho.language_code_chirho
			);
			optionsChirho(
				this.versionChirho,
				[...new Set(languageStationsChirho.map((entryChirho) => entryChirho.version_chirho))].map(
					(versionChirho) => ({ value_chirho: versionChirho, label_chirho: versionChirho })
				),
				stationChirho.version_chirho
			);
			const voicesChirho = this.voicesChirho();
			optionsChirho(
				this.narrationChirho,
				voicesChirho.map((entryChirho) => ({
					value_chirho: entryChirho.id_chirho,
					label_chirho: entryChirho.voice_chirho || 'Reader not named'
				})),
				stationChirho.id_chirho
			);
			this.stationDialChirho.max = String(Math.max(0, dialChirho.totalChirho - 1));
			this.stationDialChirho.value = String(
				(dialChirho.offsetsChirho.get(stationChirho.language_code_chirho) ?? 0) +
					Math.max(
						0,
						languageStationsChirho.findIndex(
							(entryChirho) => entryChirho.id_chirho === stationChirho.id_chirho
						)
					)
			);
			this.actualDialIndexChirho = Number(this.stationDialChirho.value);
			this.stationDialChirho.setAttribute(
				'aria-valuetext',
				`${stationChirho.language_english_chirho}, ${stationChirho.version_chirho}, ${stationChirho.voice_chirho}`
			);
			const coverageKeyChirho = `${stationChirho.id_chirho}/${bookChirho.id_chirho}`;
			if (this.coverageKeyChirho !== coverageKeyChirho) {
				this.coverageKeyChirho = coverageKeyChirho;
				this.offeredBooksChirho = BOOKS_CHIRHO.filter((entryChirho) =>
					Array.from(
						{ length: entryChirho.chapters_chirho },
						(_unusedChirho, indexChirho) => indexChirho + 1
					).some((chapterChirho) =>
						resolveChapterPlaybackChirho(stationChirho, entryChirho.id_chirho, chapterChirho)
					)
				).map((entryChirho) => ({
					value_chirho: entryChirho.order_chirho,
					label_chirho: entryChirho.name_chirho
				}));
				this.offeredChaptersChirho = Array.from(
					{ length: bookChirho.chapters_chirho },
					(_unusedChirho, indexChirho) => indexChirho + 1
				)
					.filter((chapterChirho) =>
						resolveChapterPlaybackChirho(stationChirho, bookChirho.id_chirho, chapterChirho)
					)
					.map((chapterChirho) => ({
						value_chirho: chapterChirho,
						label_chirho: String(chapterChirho)
					}));
			}
			optionsChirho(
				this.bookChirho,
				this.offeredBooksChirho.map((optionChirho) => ({
					value_chirho: BOOKS_CHIRHO[optionChirho.value_chirho - 1].id_chirho,
					label_chirho: optionChirho.label_chirho
				})),
				bookChirho.id_chirho
			);
			optionsChirho(
				this.chapterChirho,
				this.offeredChaptersChirho.map((optionChirho) => ({
					value_chirho: String(optionChirho.value_chirho),
					label_chirho: `Chapter ${optionChirho.label_chirho}`
				})),
				String(stateChirho.chapter_chirho)
			);
			for (const controlChirho of [
				this.languageChirho,
				this.versionChirho,
				this.narrationChirho,
				this.stationDialChirho,
				this.bookChirho,
				this.chapterChirho,
				this.powerChirho,
				this.soundsChirho
			])
				controlChirho.disabled = !viewChirho.ready_chirho;
			this.bookKnobChirho?.updateChirho(
				bookChirho.order_chirho,
				this.offeredBooksChirho,
				1,
				66,
				!viewChirho.ready_chirho
			);
			this.chapterKnobChirho?.updateChirho(
				stateChirho.chapter_chirho,
				this.offeredChaptersChirho,
				1,
				bookChirho.chapters_chirho,
				!viewChirho.ready_chirho
			);
			this.stationOptionsChirho = viewChirho.languages_chirho.flatMap((languageChirho) => {
				const loadedChirho = viewChirho.stations_chirho.filter(
					(entryChirho) => entryChirho.language_code_chirho === languageChirho.code_chirho
				);
				return Array.from(
					{ length: languageChirho.station_count_chirho },
					(_unusedChirho, indexChirho) => ({
						value_chirho:
							(dialChirho.offsetsChirho.get(languageChirho.code_chirho) ?? 0) + indexChirho,
						label_chirho: loadedChirho[indexChirho]
							? `${languageChirho.name_chirho} · ${loadedChirho[indexChirho].version_chirho} · ${loadedChirho[indexChirho].voice_chirho}`
							: `${languageChirho.name_chirho} · ${indexChirho + 1}`
					})
				);
			});
		}
		this.stationKnobChirho?.updateChirho(
			this.actualDialIndexChirho,
			this.stationOptionsChirho,
			0,
			Math.max(1, this.stationOptionsChirho.length - 1),
			!viewChirho.ready_chirho
		);
		this.positionKnobChirho?.updateChirho(
			stateChirho.duration_chirho > 0
				? Math.round((stateChirho.seconds_chirho / stateChirho.duration_chirho) * 100)
				: 0,
			POSITION_OPTIONS_CHIRHO,
			0,
			100,
			stateChirho.duration_chirho <= 0
		);
		const onChirho = ['playing', 'loading'].includes(stateChirho.phase_chirho);
		this.powerChirho.textContent = onChirho ? 'ON' : 'OFF';
		this.powerChirho.setAttribute('aria-pressed', String(onChirho));
		this.pressChirho.hidden = !viewChirho.needs_gesture_chirho;
		this.soundsChirho.textContent = stateChirho.sounds_enabled_chirho ? 'SFX ON' : 'SFX OFF';
		this.soundsChirho.setAttribute('aria-pressed', String(stateChirho.sounds_enabled_chirho));
		this.statusChirho.textContent =
			stateChirho.phase_chirho === 'playing'
				? 'ON AIR'
				: stateChirho.phase_chirho === 'loading'
					? 'TUNING IN'
					: stateChirho.phase_chirho === 'error'
						? 'SIGNAL LOST'
						: 'POWER OFF';
		this.clockChirho.textContent = `${timeChirho(stateChirho.seconds_chirho)} / ${timeChirho(stateChirho.duration_chirho)}`;
		this.paintPreviewsChirho();
		if (this.creditKeyChirho !== stationChirho.id_chirho) {
			this.creditKeyChirho = stationChirho.id_chirho;
			this.creditChirho.textContent = `${stationChirho.credit_chirho}\n${stationChirho.licence_name_chirho}`;
			const textChirho = elementChirho('span');
			textChirho.textContent = `${stationChirho.credit_chirho} · ${stationChirho.licence_name_chirho}`;
			this.accessibleCreditChirho.querySelector('span')?.remove();
			this.accessibleCreditChirho.insertBefore(textChirho, this.accessibleCreditChirho.firstChild);
			this.dialogChirho.querySelector('section')?.remove();
			const informationChirho = elementChirho('section');
			const titleChirho = elementChirho('h2');
			titleChirho.textContent = 'Audio Bible Radio';
			const bodyChirho = elementChirho('p');
			bodyChirho.textContent = `${stationChirho.credit_chirho} · ${stationChirho.licence_name_chirho}. Streamed from the publisher. This recording keeps its publisher’s terms.`;
			for (const childChirho of [titleChirho, bodyChirho])
				informationChirho.appendChild(childChirho);
			for (const [labelChirho, urlChirho] of [
				['Recording source', stationChirho.source_url_chirho],
				['Recording licence', stationChirho.licence_url_chirho]
			] as const) {
				const linkChirho = elementChirho('a');
				linkChirho.href = urlChirho;
				linkChirho.textContent = labelChirho;
				linkChirho.target = '_blank';
				linkChirho.rel = 'noreferrer';
				informationChirho.appendChild(linkChirho);
				informationChirho.appendChild(document.createTextNode(' · '));
			}
			this.dialogChirho.insertBefore(informationChirho, this.dialogChirho.firstChild);
		}
	}
	private paintPreviewsChirho(): void {
		const stateChirho = this.viewChirho.state_chirho;
		this.bookChirho.value =
			this.bookPreviewChirho === null
				? stateChirho.book_id_chirho
				: (BOOKS_CHIRHO[this.bookPreviewChirho - 1]?.id_chirho ?? stateChirho.book_id_chirho);
		this.chapterChirho.value = String(this.chapterPreviewChirho ?? stateChirho.chapter_chirho);
		if (this.stationPreviewChirho !== null) {
			const dialChirho = new LanguageDialChirho(this.viewChirho.languages_chirho);
			const targetChirho = dialChirho.targetChirho(this.stationPreviewChirho);
			const languageChirho = this.viewChirho.languages_chirho.find(
				(entryChirho) => entryChirho.code_chirho === targetChirho?.code_chirho
			);
			this.stationDialChirho.value = String(this.stationPreviewChirho);
			this.statusChirho.textContent = `TUNE: ${languageChirho?.name_chirho ?? ''}`;
		} else {
			this.stationDialChirho.value = String(this.actualDialIndexChirho);
			this.statusChirho.textContent =
				stateChirho.phase_chirho === 'playing'
					? 'ON AIR'
					: stateChirho.phase_chirho === 'loading'
						? 'TUNING IN'
						: stateChirho.phase_chirho === 'error'
							? 'SIGNAL LOST'
							: 'POWER OFF';
		}
	}
	disposeChirho(): void {
		this.projection_chirho.disposeChirho();
		this.accessibleCreditChirho.remove();
		this.dialogChirho.remove();
	}
}
