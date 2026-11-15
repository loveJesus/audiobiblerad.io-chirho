// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// The radio's skins. The page reads this list; the look itself lives in themes_chirho.css, which
// hangs each skin's colours and artwork on the page's own class names.
//
// What the page and the skins agree on:
//   - the page root carries data-radio-theme-chirho="<id>";
//   - artwork never draws a working control or a letter: whatever moves or can be read is live;
//   - an image field is null when that part is drawn in code.

export type RadioThemeIdChirho = 'minimal' | 'digital' | 'field' | 'cyberpunk';

export type RadioWeatherChirho = 'none' | 'rain';

/**
 * A part of a setting picture that is open water or wet ground, as fractions of the picture's
 * width and height. Rain leaves rings there and nowhere else.
 */
export interface WaterBoxChirho {
	readonly left_chirho: number;
	readonly top_chirho: number;
	readonly right_chirho: number;
	readonly bottom_chirho: number;
}

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
	/** Where that picture's water is, measured on it by eye. Null when it has none. */
	readonly water_chirho: WaterBoxChirho | null;
}

const ART_ROOT_CHIRHO = '/images-chirho/radios-chirho';

export const RADIO_THEMES_CHIRHO: readonly RadioThemeChirho[] = [
	{
		id_chirho: 'minimal',
		name_chirho: 'Minimal',
		setting_chirho: null,
		body_image_chirho: null,
		background_image_chirho: null,
		weather_chirho: 'none',
		water_chirho: null
	},
	{
		id_chirho: 'digital',
		name_chirho: '1980s Digital',
		setting_chirho: 'Nordic fjord',
		body_image_chirho: `${ART_ROOT_CHIRHO}/digital-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/digital-chirho/setting_chirho.webp`,
		weather_chirho: 'rain',
		// The fjord itself, clear of the shore rocks on the left and along the bottom.
		water_chirho: { left_chirho: 0.32, top_chirho: 0.5, right_chirho: 1, bottom_chirho: 0.72 }
	},
	{
		id_chirho: 'field',
		name_chirho: 'Field Radio',
		setting_chirho: 'Pacific Northwest riverbed',
		body_image_chirho: `${ART_ROOT_CHIRHO}/field-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/field-chirho/setting_chirho.webp`,
		weather_chirho: 'rain',
		// The open river, clear of the boulders on the left and the stones in mid-stream.
		water_chirho: { left_chirho: 0.4, top_chirho: 0.53, right_chirho: 1, bottom_chirho: 0.64 }
	},
	{
		id_chirho: 'cyberpunk',
		name_chirho: 'Cyberpunk',
		setting_chirho: 'Tokyo night',
		body_image_chirho: `${ART_ROOT_CHIRHO}/cyberpunk-chirho/body_chirho.webp`,
		background_image_chirho: `${ART_ROOT_CHIRHO}/cyberpunk-chirho/setting_chirho.webp`,
		weather_chirho: 'rain',
		// The wet street and pavement, below the planters and doorways.
		water_chirho: { left_chirho: 0, top_chirho: 0.82, right_chirho: 1, bottom_chirho: 1 }
	}
];
