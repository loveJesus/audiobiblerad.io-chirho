<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import {
		angleDeltaChirho,
		dialAngleChirho,
		nearestDialOptionChirho,
		type DialOptionChirho
	} from './dial_math_chirho';
	let {
		label_chirho: labelChirho,
		value_chirho: valueChirho,
		min_chirho: minChirho,
		max_chirho: maxChirho,
		options_chirho: optionsChirho,
		disabled_chirho: disabledChirho = false,
		arc_chirho: arcChirho = 270,
		vertical_drag_chirho: verticalDragChirho = false,
		on_feedback_chirho: onFeedbackChirho,
		on_change_chirho: onChangeChirho
	}: {
		label_chirho: string;
		value_chirho: number;
		min_chirho: number;
		max_chirho: number;
		options_chirho: readonly DialOptionChirho[];
		disabled_chirho?: boolean;
		arc_chirho?: number;
		vertical_drag_chirho?: boolean;
		on_feedback_chirho?(kindChirho: 'click' | 'knob'): void;
		on_change_chirho(valueChirho: number): void;
	} = $props();
	let previewChirho = $state<number | null>(null);
	let dragChirho: {
		pointer_id_chirho: number;
		angle_chirho: number;
		last_angle_chirho: number;
		start_y_chirho: number;
		start_value_chirho: number;
		vertical_chirho: boolean;
	} | null = null;
	const shownChirho = $derived(previewChirho ?? valueChirho);
	const inactiveChirho = $derived(disabledChirho || optionsChirho.length <= 1);
	const angleChirho = $derived(dialAngleChirho(shownChirho, minChirho, maxChirho, arcChirho));
	const textChirho = $derived(
		optionsChirho.find((optionChirho) => optionChirho.value_chirho === shownChirho)?.label_chirho ??
			String(shownChirho)
	);
	function pointAngleChirho(eventChirho: PointerEvent): number {
		const boxChirho = (eventChirho.currentTarget as HTMLElement).getBoundingClientRect();
		return (
			(Math.atan2(
				eventChirho.clientY - boxChirho.y - boxChirho.height / 2,
				eventChirho.clientX - boxChirho.x - boxChirho.width / 2
			) *
				180) /
				Math.PI +
			90
		);
	}
	function startChirho(eventChirho: PointerEvent): void {
		if (
			inactiveChirho ||
			dragChirho ||
			(eventChirho.pointerType === 'mouse' && eventChirho.button !== 0)
		)
			return;
		eventChirho.preventDefault();
		const targetChirho = eventChirho.currentTarget as HTMLElement;
		const boxChirho = targetChirho.getBoundingClientRect();
		targetChirho.focus();
		targetChirho.setPointerCapture(eventChirho.pointerId);
		dragChirho = {
			pointer_id_chirho: eventChirho.pointerId,
			angle_chirho: angleChirho,
			last_angle_chirho: pointAngleChirho(eventChirho),
			start_y_chirho: eventChirho.clientY,
			start_value_chirho: valueChirho,
			vertical_chirho:
				verticalDragChirho ||
				Math.hypot(
					eventChirho.clientX - boxChirho.x - boxChirho.width / 2,
					eventChirho.clientY - boxChirho.y - boxChirho.height / 2
				) <
					boxChirho.width * 0.25
		};
		previewChirho = valueChirho;
		onFeedbackChirho?.('knob');
	}
	function moveChirho(eventChirho: PointerEvent): void {
		if (!dragChirho || dragChirho.pointer_id_chirho !== eventChirho.pointerId) return;
		const nextAngleChirho = pointAngleChirho(eventChirho);
		const deltaChirho = angleDeltaChirho(dragChirho.last_angle_chirho, nextAngleChirho);
		dragChirho.last_angle_chirho = nextAngleChirho;
		dragChirho.angle_chirho = Math.max(
			-arcChirho / 2,
			Math.min(arcChirho / 2, dragChirho.angle_chirho + deltaChirho)
		);
		const nextValueChirho = dragChirho.vertical_chirho
			? dragChirho.start_value_chirho +
				((dragChirho.start_y_chirho - eventChirho.clientY) / 140) * (maxChirho - minChirho)
			: minChirho + (dragChirho.angle_chirho / arcChirho + 0.5) * (maxChirho - minChirho);
		const selectedChirho = nearestDialOptionChirho(
			optionsChirho,
			nextValueChirho,
			nextValueChirho - shownChirho
		);
		if (selectedChirho !== shownChirho) onFeedbackChirho?.('knob');
		previewChirho = selectedChirho;
	}
	function finishChirho(eventChirho: PointerEvent): void {
		if (!dragChirho || dragChirho.pointer_id_chirho !== eventChirho.pointerId) return;
		const selectedChirho = previewChirho;
		dragChirho = null;
		previewChirho = null;
		if (
			eventChirho.type !== 'pointercancel' &&
			selectedChirho !== null &&
			selectedChirho !== valueChirho
		)
			onChangeChirho(selectedChirho);
	}
	function keyChirho(eventChirho: KeyboardEvent): void {
		if (inactiveChirho) return;
		const indexChirho = Math.max(
			0,
			optionsChirho.findIndex((optionChirho) => optionChirho.value_chirho === valueChirho)
		);
		const stepsChirho: Record<string, number> = {
			ArrowUp: 1,
			ArrowRight: 1,
			ArrowDown: -1,
			ArrowLeft: -1,
			PageUp: 5,
			PageDown: -5
		};
		const nextChirho =
			eventChirho.key === 'Home'
				? 0
				: eventChirho.key === 'End'
					? optionsChirho.length - 1
					: eventChirho.key in stepsChirho
						? indexChirho + stepsChirho[eventChirho.key]
						: null;
		if (nextChirho === null) return;
		eventChirho.preventDefault();
		const selectedChirho =
			optionsChirho[Math.max(0, Math.min(optionsChirho.length - 1, nextChirho))].value_chirho;
		if (selectedChirho !== valueChirho) {
			onFeedbackChirho?.('knob');
			onChangeChirho(selectedChirho);
		}
	}
</script>

<div
	class="knob-control-chirho"
	style={`--knob-angle-chirho:${angleChirho}deg;--knob-arc-chirho:${arcChirho}deg`}
>
	<span class="knob-title-chirho">{labelChirho}</span>
	<div class="knob-dial-chirho">
		<div class="knob-arc-chirho" aria-hidden="true"></div>
		<div
			class="selector-knob-chirho"
			role="slider"
			tabindex={inactiveChirho ? -1 : 0}
			aria-label={`${labelChirho} knob`}
			aria-valuemin={minChirho}
			aria-valuemax={maxChirho}
			aria-valuenow={shownChirho}
			aria-valuetext={textChirho}
			aria-disabled={inactiveChirho}
			onpointerdown={startChirho}
			onpointermove={moveChirho}
			onpointerup={finishChirho}
			onpointercancel={finishChirho}
			onkeydown={keyChirho}
		>
			<span class="knob-pointer-chirho" aria-hidden="true"></span>
		</div>
		<div class="knob-endpoints-chirho" aria-hidden="true">
			<span>{minChirho}</span><span>{maxChirho}</span>
		</div>
	</div>
	<select
		class="label-select-chirho"
		aria-label={labelChirho}
		disabled={disabledChirho || optionsChirho.length === 0}
		value={shownChirho}
		onchange={(eventChirho) => {
			previewChirho = null;
			onFeedbackChirho?.('click');
			onChangeChirho(Number(eventChirho.currentTarget.value));
		}}
	>
		{#each optionsChirho as optionChirho (optionChirho.value_chirho)}<option
				value={optionChirho.value_chirho}>{optionChirho.label_chirho}</option
			>{/each}
	</select>
</div>

<style>
	.knob-control-chirho {
		display: grid;
		justify-items: center;
		gap: 0.5rem;
		min-width: 0;
		color: var(--radio-ink-chirho, #e7e5d3);
	}
	.knob-title-chirho {
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-size: 0.65rem;
		font-weight: 750;
	}
	.knob-dial-chirho {
		position: relative;
		width: 112px;
		height: 112px;
		display: grid;
		place-items: center;
	}
	.knob-arc-chirho {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			from calc(-1 * var(--knob-arc-chirho) / 2),
			var(--radio-accent-chirho, #e7bd73) 0 var(--knob-arc-chirho),
			transparent var(--knob-arc-chirho) 360deg
		);
		mask: radial-gradient(transparent 62%, #000 64%, #000 66%, transparent 68%);
		opacity: 0.65;
	}
	.selector-knob-chirho {
		width: 78px;
		height: 78px;
		position: relative;
		cursor: grab;
		touch-action: none;
		border-radius: 50%;
		border: 2px solid #646d5d;
		background: radial-gradient(circle at 35% 25%, #69705e, #30392f 65%, #161e19);
		box-shadow:
			0 5px 10px #0006,
			inset 0 1px 2px #ffffff38;
	}
	.selector-knob-chirho:active {
		cursor: grabbing;
	}
	.selector-knob-chirho:focus-visible {
		outline: 3px solid var(--radio-accent-chirho, #e7bd73);
		outline-offset: 5px;
	}
	.selector-knob-chirho[aria-disabled='true'] {
		cursor: default;
		opacity: 0.65;
	}
	.knob-pointer-chirho {
		position: absolute;
		inset: 7px;
		transform: rotate(var(--knob-angle-chirho));
		border-radius: 50%;
	}
	.knob-pointer-chirho::after {
		content: '';
		position: absolute;
		top: 0;
		left: calc(50% - 2px);
		width: 4px;
		height: 16px;
		border-radius: 2px;
		background: var(--radio-accent-chirho, #e7bd73);
		box-shadow: 0 0 5px #0005;
	}
	.knob-endpoints-chirho {
		position: absolute;
		bottom: 0;
		inset-inline: 0;
		display: flex;
		justify-content: space-between;
		font:
			10px ui-monospace,
			monospace;
		opacity: 0.6;
	}
	.label-select-chirho {
		width: 100%;
		max-width: 180px;
		min-height: 36px;
		text-align: center;
		border: 1px solid transparent;
		border-radius: 5px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 0.8rem;
		padding: 0.3rem 1.5rem 0.3rem 0.35rem;
		cursor: pointer;
		text-overflow: ellipsis;
	}
	.label-select-chirho:hover,
	.label-select-chirho:focus-visible {
		border-color: currentColor;
		background: #ffffff0c;
	}
	.label-select-chirho option {
		background: var(--radio-panel-chirho, #29312a);
		color: var(--radio-ink-chirho, #e7e5d3);
	}
	@media (max-width: 420px) {
		.knob-dial-chirho {
			width: 94px;
			height: 94px;
		}
		.selector-knob-chirho {
			width: 68px;
			height: 68px;
		}
		.label-select-chirho {
			font-size: 0.75rem;
		}
	}
</style>
