// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import * as ThreeChirho from 'three';

/** Release unique scene-owned resources, including a model that arrives after cancellation. */
export function disposeSceneObjectsChirho(
	rootChirho: ThreeChirho.Object3D,
	extraMaterialsChirho: readonly ThreeChirho.Material[] = []
): void {
	const geometriesChirho = new Set<ThreeChirho.BufferGeometry>();
	const materialsChirho = new Set(extraMaterialsChirho);
	const texturesChirho = new Set<ThreeChirho.Texture>();
	rootChirho.traverse((objectChirho) => {
		if (!(objectChirho instanceof ThreeChirho.Mesh)) return;
		geometriesChirho.add(objectChirho.geometry);
		for (const materialChirho of Array.isArray(objectChirho.material)
			? objectChirho.material
			: [objectChirho.material])
			materialsChirho.add(materialChirho);
	});
	for (const materialChirho of materialsChirho)
		for (const valueChirho of Object.values(materialChirho))
			if (valueChirho instanceof ThreeChirho.Texture) texturesChirho.add(valueChirho);
	geometriesChirho.forEach((geometryChirho) => geometryChirho.dispose());
	materialsChirho.forEach((materialChirho) => materialChirho.dispose());
	texturesChirho.forEach((textureChirho) => {
		const imagesChirho: unknown[] = Array.isArray(textureChirho.image)
			? textureChirho.image
			: [textureChirho.image];
		for (const imageChirho of imagesChirho)
			if (typeof ImageBitmap !== 'undefined' && imageChirho instanceof ImageBitmap)
				imageChirho.close();
		textureChirho.dispose();
	});
}
