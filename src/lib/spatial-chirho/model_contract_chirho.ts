// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { Group as GroupChirho } from 'three';
import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';

// See spec-chirho/workflows-chirho/experience-chirho/spatial_radio_workflow_chirho.md.
// Geometry uses CSS-pixel units with its face centered on (0, 0), front at z=0,
// x right and y up. The scene uniformly scales the group to a six-unit face width.
export interface SurfaceRectChirho {
	x_chirho: number;
	y_chirho: number;
	width_chirho: number;
	height_chirho: number;
}
export interface RadioModelOptionsChirho {
	theme_chirho: RadioThemeIdChirho;
	width_chirho: number;
	height_chirho: number;
	book_chirho: SurfaceRectChirho;
	chapter_chirho: SurfaceRectChirho;
	power_chirho: SurfaceRectChirho;
	display_chirho: SurfaceRectChirho;
	dial_chirho: SurfaceRectChirho;
	speaker_chirho?: SurfaceRectChirho;
}
export interface RadioModelStateChirho {
	book_angle_chirho: number;
	chapter_angle_chirho: number;
	powered_chirho: boolean;
}
export interface RadioModelChirho {
	group_chirho: GroupChirho;
	setStateChirho(stateChirho: RadioModelStateChirho): void;
	disposeChirho(): void;
}
