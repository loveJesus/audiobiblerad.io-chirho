// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it, vi } from 'vitest';
import {
	Scene as SceneChirho,
	Mesh as MeshChirho,
	BoxGeometry as BoxChirho,
	MeshStandardMaterial as MaterialChirho,
	Texture as TextureChirho
} from 'three';
import { disposeSceneObjectsChirho } from './dispose_scene_chirho';

it('retires shared model geometry and replaced materials and textures once', () => {
	const sceneChirho = new SceneChirho();
	const geometryChirho = new BoxChirho();
	const textureChirho = new TextureChirho();
	const materialChirho = new MaterialChirho({ map: textureChirho });
	const retiredChirho = new MaterialChirho({ normalMap: textureChirho });
	const geometryDisposeChirho = vi.spyOn(geometryChirho, 'dispose');
	const materialDisposeChirho = vi.spyOn(materialChirho, 'dispose');
	const retiredDisposeChirho = vi.spyOn(retiredChirho, 'dispose');
	const textureDisposeChirho = vi.spyOn(textureChirho, 'dispose');
	sceneChirho.add(
		new MeshChirho(geometryChirho, materialChirho),
		new MeshChirho(geometryChirho, [materialChirho, retiredChirho])
	);
	disposeSceneObjectsChirho(sceneChirho, [retiredChirho]);
	for (const disposeChirho of [
		geometryDisposeChirho,
		materialDisposeChirho,
		retiredDisposeChirho,
		textureDisposeChirho
	])
		expect(disposeChirho).toHaveBeenCalledOnce();
});
