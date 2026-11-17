// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	Mesh as MeshChirho,
	InstancedMesh as InstancedMeshChirho,
	Texture as TextureChirho,
	BufferGeometry as GeometryChirho,
	Material as MaterialChirho,
	Box3 as BoundsChirho,
	Vector3 as VectorChirho
} from 'three';
import { RADIO_THEMES_CHIRHO } from '$lib/themes-chirho/themes_chirho';
import { createRadioModelChirho } from './model-chirho/radio_model_chirho';
import { createRadioMaterialsChirho } from './model-chirho/radio_materials_chirho';
import type { RadioModelOptionsChirho } from './model_contract_chirho';

const MODEL_OPTIONS_CHIRHO: Omit<RadioModelOptionsChirho, 'theme_chirho'> = {
	width_chirho: 568,
	height_chirho: 820,
	book_chirho: { x_chirho: 60, y_chirho: 430, width_chirho: 78, height_chirho: 78 },
	chapter_chirho: { x_chirho: 430, y_chirho: 430, width_chirho: 78, height_chirho: 78 },
	power_chirho: { x_chirho: 236, y_chirho: 430, width_chirho: 96, height_chirho: 96 },
	display_chirho: { x_chirho: 24, y_chirho: 70, width_chirho: 520, height_chirho: 240 },
	dial_chirho: { x_chirho: 70, y_chirho: 340, width_chirho: 428, height_chirho: 35 },
	speaker_chirho: { x_chirho: 24, y_chirho: 650, width_chirho: 520, height_chirho: 32 }
};

describe('bounded physical receiver resources', () => {
	it('gives the stereo portable, deep field set and beveled receiver different physical silhouettes', () => {
		const dimensionsChirho = new Map<string, VectorChirho>();
		for (const themeChirho of RADIO_THEMES_CHIRHO) {
			const modelChirho = createRadioModelChirho({
				...MODEL_OPTIONS_CHIRHO,
				theme_chirho: themeChirho.id_chirho
			});
			dimensionsChirho.set(
				themeChirho.id_chirho,
				new BoundsChirho().setFromObject(modelChirho.group_chirho).getSize(new VectorChirho())
			);
			modelChirho.disposeChirho();
		}
		expect(dimensionsChirho.get('digital')!.x).toBeGreaterThan(
			dimensionsChirho.get('field')!.x * 1.5
		);
		expect(dimensionsChirho.get('field')!.z).toBeGreaterThan(
			dimensionsChirho.get('minimal')!.z * 1.7
		);
		expect(dimensionsChirho.get('cyberpunk')!.x).toBeGreaterThan(
			dimensionsChirho.get('minimal')!.x * 1.2
		);
	});
	for (const themeChirho of RADIO_THEMES_CHIRHO)
		it(`disposes every owned resource once for ${themeChirho.id_chirho}`, () => {
			const modelChirho = createRadioModelChirho({
				...MODEL_OPTIONS_CHIRHO,
				theme_chirho: themeChirho.id_chirho
			});
			const resourcesChirho = new Set<
				GeometryChirho | MaterialChirho | TextureChirho | InstancedMeshChirho
			>();
			let trianglesChirho = 0;
			const invalidGeometriesChirho: string[] = [];
			const inspectedGeometriesChirho = new Set<GeometryChirho>();
			modelChirho.group_chirho.traverse((objectChirho) => {
				if (!(objectChirho instanceof MeshChirho)) return;
				resourcesChirho.add(objectChirho.geometry);
				trianglesChirho +=
					((objectChirho.geometry.index?.count ?? objectChirho.geometry.attributes.position.count) /
						3) *
					(objectChirho instanceof InstancedMeshChirho ? objectChirho.count : 1);
				if (!inspectedGeometriesChirho.has(objectChirho.geometry)) {
					inspectedGeometriesChirho.add(objectChirho.geometry);
					if (!objectChirho.geometry.attributes.position.array.every(Number.isFinite))
						invalidGeometriesChirho.push(objectChirho.geometry.uuid);
				}
				if (objectChirho instanceof InstancedMeshChirho) resourcesChirho.add(objectChirho);
				for (const materialChirho of Array.isArray(objectChirho.material)
					? objectChirho.material
					: [objectChirho.material]) {
					resourcesChirho.add(materialChirho);
					for (const valueChirho of Object.values(materialChirho))
						if (valueChirho instanceof TextureChirho) resourcesChirho.add(valueChirho);
				}
			});
			expect(invalidGeometriesChirho).toEqual([]);
			expect(trianglesChirho).toBeGreaterThan(1000);
			expect(trianglesChirho).toBeLessThan(100000);
			const disposalsChirho = new Map<object, number>();
			for (const resourceChirho of resourcesChirho) {
				const disposedChirho = () =>
					disposalsChirho.set(resourceChirho, (disposalsChirho.get(resourceChirho) ?? 0) + 1);
				if (resourceChirho instanceof GeometryChirho)
					resourceChirho.addEventListener('dispose', disposedChirho);
				else if (resourceChirho instanceof MaterialChirho)
					resourceChirho.addEventListener('dispose', disposedChirho);
				else if (resourceChirho instanceof TextureChirho)
					resourceChirho.addEventListener('dispose', disposedChirho);
				else resourceChirho.addEventListener('dispose', disposedChirho);
			}
			modelChirho.setStateChirho({
				book_angle_chirho: 90,
				chapter_angle_chirho: -90,
				powered_chirho: true
			});
			modelChirho.disposeChirho();
			modelChirho.disposeChirho();
			for (const resourceChirho of resourcesChirho)
				expect(disposalsChirho.get(resourceChirho)).toBe(1);
		});

	it('keeps a shared material palette alive across model replacement, then retires it once', () => {
		const paletteChirho = createRadioMaterialsChirho('field');
		const disposalsChirho = new Map<object, number>();
		for (const materialChirho of paletteChirho.materialsChirho) {
			disposalsChirho.set(materialChirho, 0);
			materialChirho.addEventListener('dispose', () => {
				disposalsChirho.set(materialChirho, (disposalsChirho.get(materialChirho) ?? 0) + 1);
			});
		}
		for (const textureChirho of paletteChirho.texturesChirho) {
			disposalsChirho.set(textureChirho, 0);
			textureChirho.addEventListener('dispose', () => {
				disposalsChirho.set(textureChirho, (disposalsChirho.get(textureChirho) ?? 0) + 1);
			});
		}
		for (const heightChirho of [820, 780]) {
			const modelChirho = createRadioModelChirho(
				{ ...MODEL_OPTIONS_CHIRHO, height_chirho: heightChirho, theme_chirho: 'field' },
				paletteChirho
			);
			let usesPaletteChirho = false;
			modelChirho.group_chirho.traverse((objectChirho) => {
				if (
					objectChirho instanceof MeshChirho &&
					objectChirho.material === paletteChirho.shellChirho
				)
					usesPaletteChirho = true;
			});
			expect(usesPaletteChirho).toBe(true);
			modelChirho.disposeChirho();
			expect([...disposalsChirho.values()]).toEqual(Array(disposalsChirho.size).fill(0));
		}
		paletteChirho.disposeChirho();
		paletteChirho.disposeChirho();
		expect([...disposalsChirho.values()]).toEqual(Array(disposalsChirho.size).fill(1));
	});
});
