// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	readWidgetOptionsChirho,
	widgetMarkupChirho,
	widgetStorageChirho,
	createPreviewStorageChirho,
	widgetUrlChirho
} from './widget_options_chirho';

describe('public widget boundary', () => {
	it('isolates each configurator preview and never publishes the preview option in copied markup', () => {
		const previewChirho = createPreviewStorageChirho();
		previewChirho.setItem('preferences_chirho', 'preview');
		expect(previewChirho.getItem('preferences_chirho')).toBe('preview');
		expect(createPreviewStorageChirho().getItem('preferences_chirho')).toBeNull();
		const optionsChirho = readWidgetOptionsChirho(
			new URLSearchParams('preview_chirho=1&language_chirho=es')
		);
		expect(optionsChirho.preview_chirho).toBe(true);
		expect(widgetMarkupChirho(optionsChirho)).not.toContain('preview_chirho');
	});
	it('bounds a preview storage lifetime even if an internal caller supplies growing keys', () => {
		const previewChirho = createPreviewStorageChirho();
		for (let indexChirho = 0; indexChirho < 1000; indexChirho++)
			previewChirho.setItem(`key_${indexChirho}_chirho`, 'temporary');
		expect(previewChirho.getItem('key_0_chirho')).toBeNull();
		expect(previewChirho.getItem('key_999_chirho')).toBe('temporary');
	});
	it('accepts only supported presentation and language options', () => {
		expect(
			readWidgetOptionsChirho(
				new URLSearchParams('theme_chirho=field&language_chirho=ES&autoplay_chirho=1')
			)
		).toEqual({ theme_chirho: 'field', language_chirho: 'es', autoplay_chirho: true });
		expect(
			readWidgetOptionsChirho(
				new URLSearchParams(
					'theme_chirho=%22%3E%3Cscript%3E&language_chirho=../../secret&autoplay_chirho=true&src=https://evil.invalid/audio.mp3'
				)
			)
		).toEqual({ autoplay_chirho: false });
	});
	it('always builds a canonical widget URL and attribute-safe iframe without arbitrary addresses', () => {
		const optionsChirho = readWidgetOptionsChirho(
			new URLSearchParams(
				'theme_chirho=cyberpunk&language_chirho=hi&autoplay_chirho=1&src=https://evil.invalid'
			)
		);
		const urlChirho = new URL(widgetUrlChirho(optionsChirho));
		expect(urlChirho.origin).toBe('https://audiobiblerad.io');
		expect(urlChirho.pathname).toBe('/embed-chirho');
		expect(urlChirho.searchParams.has('src')).toBe(false);
		expect(widgetMarkupChirho(optionsChirho)).toContain('&amp;language_chirho=hi');
		expect(widgetMarkupChirho(optionsChirho)).not.toContain('evil.invalid');
	});
	it('keeps widget storage separate with a fixed prefix and passes denied-storage failure through', () => {
		const entriesChirho = new Map([['preferences_chirho', 'main']]);
		const storageChirho = widgetStorageChirho({
			getItem: (keyChirho) => entriesChirho.get(keyChirho) ?? null,
			setItem: (keyChirho, valueChirho) => {
				entriesChirho.set(keyChirho, valueChirho);
			}
		})!;
		storageChirho.setItem('preferences_chirho', 'widget');
		expect(storageChirho.getItem('preferences_chirho')).toBe('widget');
		expect(entriesChirho.get('preferences_chirho')).toBe('main');
		expect(entriesChirho.size).toBe(2);
		expect(widgetStorageChirho(null)).toBeNull();
		const deniedChirho = widgetStorageChirho({
			getItem: () => {
				throw new Error('denied');
			},
			setItem: () => {
				throw new Error('denied');
			}
		})!;
		expect(() => deniedChirho.getItem('key_chirho')).toThrow('denied');
	});
});
