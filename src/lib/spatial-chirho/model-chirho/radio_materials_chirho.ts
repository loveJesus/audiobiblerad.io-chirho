// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	DataTexture as DataTextureChirho,
	MeshPhysicalMaterial as MeshPhysicalMaterialChirho,
	MeshStandardMaterial as MeshStandardMaterialChirho,
	RepeatWrapping as RepeatWrappingChirho,
	RGBAFormat as RGBAFormatChirho,
	type Material as MaterialChirho,
	type Texture as TextureChirho
} from 'three';
import type { RadioModelOptionsChirho } from '../model_contract_chirho';

interface RadioPaletteChirho {
	case_chirho: string;
	face_chirho: string;
	metal_chirho: string;
	knob_chirho: string;
	screen_chirho: string;
	accent_chirho: string;
	second_chirho: string;
	case_metalness_chirho: number;
	face_roughness_chirho: number;
}

const PALETTES_CHIRHO: Record<RadioModelOptionsChirho['theme_chirho'], RadioPaletteChirho> = {
	minimal: {
		case_chirho: '#d5cdbc',
		face_chirho: '#f0e8d8',
		metal_chirho: '#c0b9a9',
		knob_chirho: '#373b36',
		screen_chirho: '#1c3029',
		accent_chirho: '#e3b76a',
		second_chirho: '#d6c49e',
		case_metalness_chirho: 0.12,
		face_roughness_chirho: 0.54
	},
	digital: {
		case_chirho: '#333944',
		face_chirho: '#b8c1c5',
		metal_chirho: '#d0d6d9',
		knob_chirho: '#272d34',
		screen_chirho: '#142a2b',
		accent_chirho: '#78e8ce',
		second_chirho: '#e6a45f',
		case_metalness_chirho: 0.65,
		face_roughness_chirho: 0.31
	},
	field: {
		case_chirho: '#20281b',
		face_chirho: '#293220',
		metal_chirho: '#858578',
		knob_chirho: '#0b0d09',
		screen_chirho: '#1e2a1c',
		accent_chirho: '#ecc680',
		second_chirho: '#a79357',
		case_metalness_chirho: 0.08,
		face_roughness_chirho: 0.69
	},
	cyberpunk: {
		case_chirho: '#121a26',
		face_chirho: '#252c3a',
		metal_chirho: '#525e70',
		knob_chirho: '#101820',
		screen_chirho: '#071c2a',
		accent_chirho: '#47f5ee',
		second_chirho: '#ed49b8',
		case_metalness_chirho: 0.7,
		face_roughness_chirho: 0.38
	}
};

/** Tiny deterministic surface maps stay local to the model; no DOM or remote asset is needed. */
function grainTextureChirho(brushedChirho: boolean): DataTextureChirho {
	const sideChirho = 64;
	const bytesChirho = new Uint8Array(sideChirho * sideChirho * 4);
	for (let rowChirho = 0; rowChirho < sideChirho; rowChirho += 1) {
		for (let columnChirho = 0; columnChirho < sideChirho; columnChirho += 1) {
			const hashChirho =
				Math.imul(columnChirho + 71, 374761393) ^ Math.imul(rowChirho + 29, 668265263);
			const noiseChirho = ((hashChirho ^ (hashChirho >>> 13)) >>> 0) % 89;
			const valueChirho = brushedChirho
				? 136 + ((rowChirho * 37) % 71) + Math.floor(noiseChirho / 8)
				: 128 + noiseChirho;
			const offsetChirho = (rowChirho * sideChirho + columnChirho) * 4;
			bytesChirho.set([valueChirho, valueChirho, valueChirho, 255], offsetChirho);
		}
	}
	const textureChirho = new DataTextureChirho(
		bytesChirho,
		sideChirho,
		sideChirho,
		RGBAFormatChirho
	);
	textureChirho.wrapS = textureChirho.wrapT = RepeatWrappingChirho;
	textureChirho.repeat.set(brushedChirho ? 3 : 8, brushedChirho ? 12 : 8);
	textureChirho.needsUpdate = true;
	return textureChirho;
}

export function createRadioMaterialsChirho(themeChirho: RadioModelOptionsChirho['theme_chirho']) {
	const paletteChirho = PALETTES_CHIRHO[themeChirho];
	const crinkleChirho = grainTextureChirho(false);
	const brushedChirho = grainTextureChirho(true);
	const materialsChirho: MaterialChirho[] = [];
	function keepChirho<MaterialTypeChirho extends MaterialChirho>(
		materialChirho: MaterialTypeChirho
	): MaterialTypeChirho {
		materialsChirho.push(materialChirho);
		return materialChirho;
	}
	const shellChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.case_chirho,
			roughness: themeChirho === 'field' ? 0.78 : 0.46,
			metalness: paletteChirho.case_metalness_chirho,
			bumpMap: crinkleChirho,
			bumpScale: themeChirho === 'field' ? 0.5 : 0.18
		})
	);
	const faceChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.face_chirho,
			roughness: paletteChirho.face_roughness_chirho,
			// Olive enamel is a dielectric paint over steel, not bare reflective metal.
			metalness: themeChirho === 'digital' ? 0.8 : themeChirho === 'field' ? 0.06 : 0.3,
			bumpMap: themeChirho === 'digital' ? brushedChirho : crinkleChirho,
			bumpScale: themeChirho === 'field' ? 0.24 : 0.07
		})
	);
	const metalChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.metal_chirho,
			metalness: 0.9,
			roughness: themeChirho === 'field' ? 0.44 : 0.32,
			bumpMap: brushedChirho,
			bumpScale: 0.06
		})
	);
	const rubberChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: '#131816',
			roughness: 0.91,
			metalness: 0.02,
			bumpMap: crinkleChirho,
			bumpScale: 0.12
		})
	);
	const knobChirho = keepChirho(
		new MeshPhysicalMaterialChirho({
			color: paletteChirho.knob_chirho,
			roughness: themeChirho === 'field' ? 0.28 : 0.42,
			metalness: themeChirho === 'digital' ? 0.65 : themeChirho === 'field' ? 0 : 0.18,
			clearcoat: themeChirho === 'field' ? 0.72 : 0.22,
			clearcoatRoughness: themeChirho === 'field' ? 0.2 : 0.3
		})
	);
	const cavityChirho = keepChirho(
		new MeshStandardMaterialChirho({ color: '#080c0d', roughness: 1 })
	);
	const screenChirho = keepChirho(
		new MeshPhysicalMaterialChirho({
			color: paletteChirho.screen_chirho,
			roughness: 0.22,
			metalness: 0.16,
			clearcoat: 1,
			clearcoatRoughness: 0.12,
			emissive: paletteChirho.screen_chirho,
			emissiveIntensity: 0.2
		})
	);
	const accentChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.accent_chirho,
			metalness: 0.3,
			roughness: 0.42,
			emissive: paletteChirho.accent_chirho,
			emissiveIntensity: themeChirho === 'cyberpunk' ? 0.8 : 0.08
		})
	);
	const secondaryChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.second_chirho,
			metalness: 0.5,
			roughness: 0.4,
			emissive: paletteChirho.second_chirho,
			emissiveIntensity: themeChirho === 'cyberpunk' ? 0.6 : 0
		})
	);
	const powerChirho = keepChirho(
		new MeshStandardMaterialChirho({
			color: paletteChirho.accent_chirho,
			emissive: paletteChirho.accent_chirho,
			emissiveIntensity: 0.05,
			roughness: 0.3,
			metalness: 0.15
		})
	);
	const texturesChirho: TextureChirho[] = [crinkleChirho, brushedChirho];
	let disposedChirho = false;
	return {
		shellChirho,
		faceChirho,
		metalChirho,
		rubberChirho,
		knobChirho,
		cavityChirho,
		screenChirho,
		accentChirho,
		secondaryChirho,
		powerChirho,
		materialsChirho,
		texturesChirho,
		disposeChirho(): void {
			if (disposedChirho) return;
			disposedChirho = true;
			for (const materialChirho of materialsChirho) materialChirho.dispose();
			for (const textureChirho of texturesChirho) textureChirho.dispose();
		}
	};
}

export type RadioMaterialsChirho = ReturnType<typeof createRadioMaterialsChirho>;
