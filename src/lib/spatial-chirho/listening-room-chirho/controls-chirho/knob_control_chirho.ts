// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	dialAngleChirho,
	nearestDialOptionChirho,
	type DialOptionChirho
} from '$lib/controls-chirho/dial_math_chirho';

export class KnobControlChirho {
	readonly element_chirho = document.createElement('button');
	private optionsChirho: readonly DialOptionChirho[] = [];
	private valueChirho = 0;
	private minChirho = 0;
	private maxChirho = 1;
	private dragChirho: {
		id_chirho: number;
		start_y_chirho: number;
		start_value_chirho: number;
		value_chirho: number;
	} | null = null;
	constructor(
		labelChirho: string,
		private readonly changeChirho: (valueChirho: number) => void,
		private readonly feedbackChirho: () => void,
		private readonly previewChirho?: (valueChirho: number | null) => void,
		private readonly dragPixelsChirho = 140
	) {
		const buttonChirho = this.element_chirho;
		buttonChirho.type = 'button';
		buttonChirho.className = 'room-knob-chirho';
		buttonChirho.setAttribute('role', 'slider');
		buttonChirho.setAttribute('aria-label', labelChirho);
		buttonChirho.title = `${labelChirho}: drag up or down, or use arrow keys`;
		buttonChirho.innerHTML = '<span aria-hidden="true"></span>';
		buttonChirho.addEventListener('pointerdown', (eventChirho) => {
			if (
				buttonChirho.disabled ||
				this.dragChirho ||
				(eventChirho.pointerType === 'mouse' && eventChirho.button !== 0)
			)
				return;
			eventChirho.preventDefault();
			buttonChirho.focus();
			buttonChirho.setPointerCapture(eventChirho.pointerId);
			this.dragChirho = {
				id_chirho: eventChirho.pointerId,
				start_y_chirho: eventChirho.clientY,
				start_value_chirho: this.valueChirho,
				value_chirho: this.valueChirho
			};
		});
		buttonChirho.addEventListener('pointermove', (eventChirho) => {
			const dragChirho = this.dragChirho;
			if (!dragChirho || dragChirho.id_chirho !== eventChirho.pointerId) return;
			const rawChirho =
				dragChirho.start_value_chirho +
				((dragChirho.start_y_chirho - eventChirho.clientY) / this.dragPixelsChirho) *
					(this.maxChirho - this.minChirho);
			const nextChirho = nearestDialOptionChirho(
				this.optionsChirho,
				rawChirho,
				rawChirho - dragChirho.value_chirho
			);
			if (nextChirho !== dragChirho.value_chirho) {
				this.feedbackChirho();
				dragChirho.value_chirho = nextChirho;
				this.paintChirho(nextChirho);
				this.previewChirho?.(nextChirho);
			}
		});
		const finishChirho = (eventChirho: PointerEvent) => {
			const dragChirho = this.dragChirho;
			if (!dragChirho || dragChirho.id_chirho !== eventChirho.pointerId) return;
			this.dragChirho = null;
			if (eventChirho.type === 'pointerup' && dragChirho.value_chirho !== this.valueChirho)
				this.changeChirho(dragChirho.value_chirho);
			else this.paintChirho(this.valueChirho);
			this.previewChirho?.(null);
		};
		buttonChirho.addEventListener('pointerup', finishChirho);
		buttonChirho.addEventListener('pointercancel', finishChirho);
		buttonChirho.addEventListener('lostpointercapture', finishChirho);
		buttonChirho.addEventListener('keydown', (eventChirho) => {
			const directionChirho = ['ArrowRight', 'ArrowUp'].includes(eventChirho.key)
				? 1
				: ['ArrowLeft', 'ArrowDown'].includes(eventChirho.key)
					? -1
					: 0;
			if (!directionChirho && !['Home', 'End'].includes(eventChirho.key)) return;
			eventChirho.preventDefault();
			const indexChirho = Math.max(
				0,
				this.optionsChirho.findIndex(
					(optionChirho) => optionChirho.value_chirho === this.valueChirho
				)
			);
			const nextIndexChirho =
				eventChirho.key === 'Home'
					? 0
					: eventChirho.key === 'End'
						? this.optionsChirho.length - 1
						: Math.max(0, Math.min(this.optionsChirho.length - 1, indexChirho + directionChirho));
			const nextChirho = this.optionsChirho[nextIndexChirho]?.value_chirho;
			if (nextChirho !== undefined && nextChirho !== this.valueChirho) {
				this.feedbackChirho();
				this.changeChirho(nextChirho);
			}
		});
	}
	updateChirho(
		valueChirho: number,
		optionsChirho: readonly DialOptionChirho[],
		minChirho: number,
		maxChirho: number,
		disabledChirho: boolean
	): void {
		this.valueChirho = valueChirho;
		this.optionsChirho = optionsChirho;
		this.minChirho = minChirho;
		this.maxChirho = maxChirho;
		this.element_chirho.disabled = disabledChirho || optionsChirho.length < 2;
		if (!this.dragChirho) this.paintChirho(valueChirho);
	}
	private paintChirho(valueChirho: number): void {
		this.element_chirho.setAttribute('aria-valuemin', String(this.minChirho));
		this.element_chirho.setAttribute('aria-valuemax', String(this.maxChirho));
		this.element_chirho.setAttribute('aria-valuenow', String(valueChirho));
		this.element_chirho.setAttribute(
			'aria-valuetext',
			this.optionsChirho.find((optionChirho) => optionChirho.value_chirho === valueChirho)
				?.label_chirho ?? String(valueChirho)
		);
		this.element_chirho.style.setProperty(
			'--knob-angle-chirho',
			`${dialAngleChirho(valueChirho, this.minChirho, this.maxChirho, 270)}deg`
		);
	}
}
