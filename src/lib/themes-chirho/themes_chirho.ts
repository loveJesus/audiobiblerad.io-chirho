// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's skins. The page reads this list; the look itself lives in themes_chirho.css, which
// hangs each skin's colours and artwork on the page's own class names.
//
// What the page and the skins agree on:
//   - the page root carries data-radio-theme-chirho="<id>";
//   - artwork never draws a working control or a letter: whatever moves or can be read is live;
//   - an image field is null when that part is drawn in code, or its artwork has not landed yet.

export type RadioThemeIdChirho = 'minimal' | 'digital' | 'field' | 'cyberpunk';

export type RadioWeatherChirho = 'none' | 'rain';

export interface RadioThemeChirho {
	readonly id_chirho: RadioThemeIdChirho;
	/** Shown where a person chooses a skin. */
	readonly name_chirho: string;
	/** The place the radio sits in. Null when it sits on plain paper. */
	readonly setting_chirho: string | null;
	/**
	 * Site path of the chassis artwork. themes_chirho.css applies it; the page only needs the
	 * path if it wants to warm the picture, and must not do that before first sound.
	 */
	readonly body_image_chirho: string | null;
	/** Site path of the setting picture that ThemeSceneChirho shows behind the page. */
	readonly background_image_chirho: string | null;
	readonly weather_chirho: RadioWeatherChirho;
}

const ART_ROOT_CHIRHO = '/images-chirho/radios-chirho';

export const RADIO_THEMES_CHIRHO: readonly RadioThemeChirho[] = [
	{
		id_chirho: 'minimal',
		name_chirho: 'Minimal',
		setting_chirho: null,
		body_image_chirho: null,
		background_image_chirho: null,
		weather_chirho: 'none'
	},
	{
		id_chirho: 'digital',
		name_chirho: '1980s Digital',
		setting_chirho: 'Nordic fjord',
		body_image_chirho: `${ART_ROOT_CHIRHO}/digital-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/digital-chirho/setting_chirho.webp`,
		weather_chirho: 'rain'
	},
	{
		id_chirho: 'field',
		name_chirho: 'Field Radio',
		setting_chirho: 'Pacific Northwest riverbed',
		body_image_chirho: `${ART_ROOT_CHIRHO}/field-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/field-chirho/setting_chirho.webp`,
		weather_chirho: 'rain'
	},
	{
		id_chirho: 'cyberpunk',
		name_chirho: 'Cyberpunk',
		setting_chirho: 'Tokyo night',
		body_image_chirho: `${ART_ROOT_CHIRHO}/cyberpunk-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/cyberpunk-chirho/setting_chirho.webp`,
		weather_chirho: 'rain'
	}
];
