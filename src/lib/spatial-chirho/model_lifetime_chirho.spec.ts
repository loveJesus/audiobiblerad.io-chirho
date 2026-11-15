// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	Mesh as MeshChirho,
	InstancedMesh as InstancedMeshChirho,
	Texture as TextureChirho,
	BufferGeometry as GeometryChirho,
	Material as MaterialChirho
} from 'three';
import { RADIO_THEMES_CHIRHO } from '$lib/themes-chirho/themes_chirho';
import { createRadioModelChirho } from './model-chirho/radio_model_chirho';

describe('bounded physical receiver resources', () => {
	for (const themeChirho of RADIO_THEMES_CHIRHO)
		it(`disposes every owned resource once for ${themeChirho.id_chirho}`, () => {
			const modelChirho = createRadioModelChirho({
				theme_chirho: themeChirho.id_chirho,
				width_chirho: 568,
				height_chirho: 820,
				book_chirho: { x_chirho: 60, y_chirho: 430, width_chirho: 78, height_chirho: 78 },
				chapter_chirho: { x_chirho: 430, y_chirho: 430, width_chirho: 78, height_chirho: 78 },
				power_chirho: { x_chirho: 236, y_chirho: 430, width_chirho: 96, height_chirho: 96 },
				display_chirho: { x_chirho: 24, y_chirho: 70, width_chirho: 520, height_chirho: 240 },
				dial_chirho: { x_chirho: 70, y_chirho: 340, width_chirho: 428, height_chirho: 35 },
				speaker_chirho: { x_chirho: 24, y_chirho: 650, width_chirho: 520, height_chirho: 32 }
			});
			const resourcesChirho = new Set<
				GeometryChirho | MaterialChirho | TextureChirho | InstancedMeshChirho
			>();
			let trianglesChirho = 0;
			modelChirho.group_chirho.traverse((objectChirho) => {
				if (!(objectChirho instanceof MeshChirho)) return;
				resourcesChirho.add(objectChirho.geometry);
				trianglesChirho +=
					((objectChirho.geometry.index?.count ?? objectChirho.geometry.attributes.position.count) /
						3) *
					(objectChirho instanceof InstancedMeshChirho ? objectChirho.count : 1);
				for (const valueChirho of objectChirho.geometry.attributes.position.array)
					expect(Number.isFinite(valueChirho)).toBe(true);
				if (objectChirho instanceof InstancedMeshChirho) resourcesChirho.add(objectChirho);
				for (const materialChirho of Array.isArray(objectChirho.material)
					? objectChirho.material
					: [objectChirho.material]) {
					resourcesChirho.add(materialChirho);
					for (const valueChirho of Object.values(materialChirho))
						if (valueChirho instanceof TextureChirho) resourcesChirho.add(valueChirho);
				}
			});
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
});
