// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ThemeSceneChirho from './ThemeSceneChirho.svelte';

describe('theme scene', () => {
	it('is decoration: it takes no taps, holds nothing to focus and is hidden from screen readers', async () => {
		const { container: containerChirho } = await render(ThemeSceneChirho, {
			theme_id_chirho: 'field'
		});
		const sceneChirho = containerChirho.firstElementChild as HTMLElement;

		// Wait for the picture and the weather, so the whole scene is what gets checked.
		await expect.poll(() => sceneChirho.querySelector('canvas')).not.toBeNull();
		await expect.poll(() => sceneChirho.querySelector('img')).not.toBeNull();

		expect(sceneChirho.getAttribute('aria-hidden')).toBe('true');
		expect(getComputedStyle(sceneChirho).pointerEvents).toBe('none');
		expect(
			sceneChirho.querySelectorAll('a, button, input, select, textarea, [tabindex]').length
		).toBe(0);
	});

	it('asks for no picture and draws no weather for the skin that sits on plain paper', async () => {
		const { container: containerChirho } = await render(ThemeSceneChirho, {
			theme_id_chirho: 'minimal'
		});
		const sceneChirho = containerChirho.firstElementChild as HTMLElement;

		// Longer than the scene waits before it starts its work.
		await new Promise((resolveChirho) => setTimeout(resolveChirho, 500));

		expect(sceneChirho.querySelector('img, canvas')).toBeNull();
	});
});
