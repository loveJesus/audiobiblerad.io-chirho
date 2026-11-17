// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	BufferGeometry as GeometryChirho,
	Group as GroupChirho,
	InstancedMesh as InstancedMeshChirho,
	Material as MaterialChirho,
	Mesh as MeshChirho,
	MeshStandardMaterial as StandardMaterialChirho,
	Object3D as ObjectChirho,
	type Texture as TextureChirho,
	type MeshStandardMaterialParameters as MaterialOptionsChirho
} from 'three';

export interface WorldPoseChirho {
	position_chirho: readonly [number, number, number];
	scale_chirho: readonly [number, number, number];
	rotation_chirho?: readonly [number, number, number];
}

/** One environment owns a bounded set of shared mesh resources. No network or audio dependency. */
export class WorldResourcesChirho {
	readonly groupChirho = new GroupChirho();
	private readonly geometriesChirho = new Map<string, GeometryChirho>();
	private readonly materialsChirho = new Set<MaterialChirho>();
	private readonly instancesChirho: InstancedMeshChirho[] = [];
	private readonly texturesChirho = new Set<TextureChirho>();
	private disposedChirho = false;

	geometryChirho(keyChirho: string, makeChirho: () => GeometryChirho): GeometryChirho {
		let geometryChirho = this.geometriesChirho.get(keyChirho);
		if (!geometryChirho) {
			geometryChirho = makeChirho();
			this.geometriesChirho.set(keyChirho, geometryChirho);
		}
		return geometryChirho;
	}

	materialChirho(optionsChirho: MaterialOptionsChirho): StandardMaterialChirho {
		return this.keepMaterialChirho(new StandardMaterialChirho(optionsChirho));
	}

	keepMaterialChirho<MaterialTypeChirho extends MaterialChirho>(
		materialChirho: MaterialTypeChirho
	): MaterialTypeChirho {
		this.materialsChirho.add(materialChirho);
		return materialChirho;
	}

	keepTextureChirho<TextureTypeChirho extends TextureChirho>(
		textureChirho: TextureTypeChirho
	): TextureTypeChirho {
		this.texturesChirho.add(textureChirho);
		return textureChirho;
	}

	meshChirho(
		geometryChirho: GeometryChirho,
		materialChirho: MaterialChirho,
		poseChirho: WorldPoseChirho
	): MeshChirho {
		const meshChirho = new MeshChirho(geometryChirho, materialChirho);
		meshChirho.position.set(...poseChirho.position_chirho);
		meshChirho.scale.set(...poseChirho.scale_chirho);
		meshChirho.rotation.set(...(poseChirho.rotation_chirho ?? [0, 0, 0]));
		meshChirho.castShadow = true;
		meshChirho.receiveShadow = true;
		this.groupChirho.add(meshChirho);
		return meshChirho;
	}

	batchChirho(
		geometryChirho: GeometryChirho,
		materialChirho: MaterialChirho,
		posesChirho: readonly WorldPoseChirho[]
	): void {
		if (!posesChirho.length) return;
		const meshChirho = new InstancedMeshChirho(geometryChirho, materialChirho, posesChirho.length);
		const transformChirho = new ObjectChirho();
		posesChirho.forEach((poseChirho, indexChirho) => {
			transformChirho.position.set(...poseChirho.position_chirho);
			transformChirho.scale.set(...poseChirho.scale_chirho);
			transformChirho.rotation.set(...(poseChirho.rotation_chirho ?? [0, 0, 0]));
			transformChirho.updateMatrix();
			meshChirho.setMatrixAt(indexChirho, transformChirho.matrix);
		});
		meshChirho.castShadow = true;
		meshChirho.receiveShadow = true;
		this.instancesChirho.push(meshChirho);
		this.groupChirho.add(meshChirho);
	}

	disposeChirho(): void {
		if (this.disposedChirho) return;
		this.disposedChirho = true;
		for (const instanceChirho of this.instancesChirho) instanceChirho.dispose();
		for (const geometryChirho of this.geometriesChirho.values()) geometryChirho.dispose();
		for (const materialChirho of this.materialsChirho) materialChirho.dispose();
		for (const textureChirho of this.texturesChirho) textureChirho.dispose();
		this.groupChirho.clear();
		this.groupChirho.removeFromParent();
	}
}

/** Fixed spatial variation, so moving a camera or rebuilding layout does not reshuffle a place. */
export function noiseChirho(seedChirho: number): number {
	const valueChirho = Math.sin(seedChirho * 127.1 + 311.7) * 43758.5453123;
	return valueChirho - Math.floor(valueChirho);
}
