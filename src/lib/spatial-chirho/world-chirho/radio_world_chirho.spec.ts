// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	Box3 as BoundsChirho,
	BufferGeometry as GeometryChirho,
	InstancedMesh as InstancesChirho,
	Material as MaterialChirho,
	Mesh as MeshChirho,
	LineSegments as LinesChirho,
	Vector3 as VectorChirho,
	Texture as TextureChirho
} from 'three';
import { RADIO_THEMES_CHIRHO } from '$lib/themes-chirho/themes_chirho';
import { createRadioWorldChirho } from './radio_world_chirho';

describe('owned orbitable environments', () => {
	for (const themeChirho of RADIO_THEMES_CHIRHO) {
		it(`keeps ${themeChirho.id_chirho} finite and bounded, then retires its resources once`, () => {
			const worldChirho = createRadioWorldChirho(themeChirho.id_chirho);
			const resourcesChirho = new Set<
				GeometryChirho | MaterialChirho | InstancesChirho | TextureChirho
			>();
			let trianglesChirho = 0;
			for (const secondsChirho of [0, 12.5, 1e7, Number.NaN])
				worldChirho.updateChirho(secondsChirho);
			let finiteChirho = true;
			worldChirho.group_chirho.traverse((objectChirho) => {
				if (!(objectChirho instanceof MeshChirho || objectChirho instanceof LinesChirho)) return;
				resourcesChirho.add(objectChirho.geometry);
				finiteChirho &&= objectChirho.geometry.attributes.position.array.every(Number.isFinite);
				if (objectChirho instanceof MeshChirho)
					trianglesChirho +=
						((objectChirho.geometry.index?.count ??
							objectChirho.geometry.attributes.position.count) /
							3) *
						(objectChirho instanceof InstancesChirho ? objectChirho.count : 1);
				if (objectChirho instanceof InstancesChirho) {
					resourcesChirho.add(objectChirho);
					finiteChirho &&= objectChirho.instanceMatrix.array.every(Number.isFinite);
				}
				for (const materialChirho of Array.isArray(objectChirho.material)
					? objectChirho.material
					: [objectChirho.material]) {
					resourcesChirho.add(materialChirho);
					for (const valueChirho of Object.values(materialChirho))
						if (valueChirho instanceof TextureChirho) resourcesChirho.add(valueChirho);
				}
			});
			expect(finiteChirho).toBe(true);
			expect(trianglesChirho).toBeLessThan(60000);
			const boundsChirho = new BoundsChirho().setFromObject(worldChirho.group_chirho);
			const sizeChirho = boundsChirho.getSize(new VectorChirho());
			expect(sizeChirho.x).toBeGreaterThan(25);
			expect(sizeChirho.z).toBeGreaterThan(25);
			const disposalsChirho = new Map<object, number>();
			for (const resourceChirho of resourcesChirho) {
				const retiredChirho = (): void => {
					disposalsChirho.set(resourceChirho, (disposalsChirho.get(resourceChirho) ?? 0) + 1);
				};
				if (resourceChirho instanceof GeometryChirho)
					resourceChirho.addEventListener('dispose', retiredChirho);
				else if (resourceChirho instanceof MaterialChirho)
					resourceChirho.addEventListener('dispose', retiredChirho);
				else if (resourceChirho instanceof TextureChirho)
					resourceChirho.addEventListener('dispose', retiredChirho);
				else resourceChirho.addEventListener('dispose', retiredChirho);
			}
			worldChirho.disposeChirho();
			worldChirho.disposeChirho();
			worldChirho.updateChirho(20);
			for (const resourceChirho of resourcesChirho)
				expect(disposalsChirho.get(resourceChirho)).toBe(1);
			expect(worldChirho.group_chirho.children).toHaveLength(0);
		});
	}
});
