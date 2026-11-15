// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { RADIO_THEMES_CHIRHO, type RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
import {
	savedLanguageCodeChirho,
	type PreferenceStorageChirho
} from '$lib/player-chirho/player_preferences_chirho';
import { SITE_URL_CHIRHO } from '$lib/site-chirho/site_config_chirho';

export interface WidgetOptionsChirho {
	theme_chirho?: RadioThemeIdChirho;
	language_chirho?: string;
	autoplay_chirho: boolean;
	preview_chirho?: boolean;
}

/** Query values select cleared catalogue data; no external media or callback URL is accepted. */
export function readWidgetOptionsChirho(parametersChirho: URLSearchParams): WidgetOptionsChirho {
	const themeChirho = parametersChirho.get('theme_chirho');
	const languageChirho = parametersChirho.get('language_chirho')?.toLowerCase();
	return {
		...(RADIO_THEMES_CHIRHO.some((entryChirho) => entryChirho.id_chirho === themeChirho)
			? { theme_chirho: themeChirho as RadioThemeIdChirho }
			: {}),
		...(languageChirho && savedLanguageCodeChirho(languageChirho)
			? { language_chirho: languageChirho }
			: {}),
		autoplay_chirho: parametersChirho.get('autoplay_chirho') === '1',
		...(parametersChirho.get('preview_chirho') === '1' ? { preview_chirho: true } : {})
	};
}

export function widgetUrlChirho(optionsChirho: WidgetOptionsChirho): string {
	const urlChirho = new URL('/embed-chirho', SITE_URL_CHIRHO);
	if (optionsChirho.theme_chirho)
		urlChirho.searchParams.set('theme_chirho', optionsChirho.theme_chirho);
	if (optionsChirho.language_chirho)
		urlChirho.searchParams.set('language_chirho', optionsChirho.language_chirho);
	if (optionsChirho.autoplay_chirho) urlChirho.searchParams.set('autoplay_chirho', '1');
	return urlChirho.href;
}

export const WIDGET_HEIGHT_CHIRHO = 760;

/** A configurator frame previews a fresh visitor without replacing saved widget preferences. */
export function createPreviewStorageChirho(): PreferenceStorageChirho {
	const valuesChirho = new Map<string, string>();
	return {
		getItem: (keyChirho) => valuesChirho.get(keyChirho) ?? null,
		setItem: (keyChirho, valueChirho) => {
			if (!valuesChirho.has(keyChirho) && valuesChirho.size >= 8)
				valuesChirho.delete(valuesChirho.keys().next().value!);
			valuesChirho.set(keyChirho, valueChirho);
		}
	};
}

export function widgetMarkupChirho(optionsChirho: WidgetOptionsChirho): string {
	const urlChirho = widgetUrlChirho(optionsChirho).replaceAll('&', '&amp;');
	return `<iframe\n  src="${urlChirho}"\n  title="Audio Bible Radio"\n  width="100%"\n  height="${WIDGET_HEIGHT_CHIRHO}"\n  style="display:block;max-width:560px;border:0;border-radius:16px"\n  loading="lazy"\n  allow="autoplay"\n  referrerpolicy="no-referrer"\n></iframe>`;
}

/** One fixed widget namespace; embedding never replaces the full radio's device preferences. */
export function widgetStorageChirho(
	storageChirho: PreferenceStorageChirho | null
): PreferenceStorageChirho | null {
	if (!storageChirho) return null;
	const prefixChirho = 'audio-bible-radio-widget-chirho:';
	return {
		getItem: (keyChirho) => storageChirho.getItem(prefixChirho + keyChirho),
		setItem: (keyChirho, valueChirho) =>
			storageChirho.setItem(prefixChirho + keyChirho, valueChirho)
	};
}
