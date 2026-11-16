// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	WebGLRenderer as RendererChirho,
	PerspectiveCamera as CameraChirho,
	Scene as SceneChirho,
	DirectionalLight as DirectionalLightChirho,
	HemisphereLight as HemisphereLightChirho,
	PMREMGenerator as PMREMGeneratorChirho,
	ACESFilmicToneMapping as ToneMappingChirho,
	SRGBColorSpace as ColorSpaceChirho,
	PCFShadowMap as ShadowMapChirho
} from 'three';
import { OrbitControls as OrbitControlsChirho } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment as RoomEnvironmentChirho } from 'three/addons/environments/RoomEnvironment.js';
import { createRadioModelChirho } from './model-chirho/radio_model_chirho';
import { createRadioMaterialsChirho } from './model-chirho/radio_materials_chirho';
import { surfaceProjectionChirho } from './surface_projection_chirho';
import type { RadioThemeIdChirho } from '$lib/themes-chirho/themes_chirho';
import type {
	RadioModelChirho,
	RadioModelOptionsChirho,
	SurfaceRectChirho
} from './model_contract_chirho';

export interface RadioSceneChirho {
	activateChirho(activeChirho: boolean): void;
	themeChirho(themeChirho: RadioThemeIdChirho): void;
	frontChirho(): void;
	disposeChirho(): void;
}
export interface RadioSceneOptionsChirho {
	host_chirho: HTMLElement;
	face_chirho: HTMLElement;
	theme_chirho: RadioThemeIdChirho;
	on_ready_chirho(): void;
	on_failure_chirho(): void;
}

// See spec-chirho/workflows-chirho/experience-chirho/spatial_radio_workflow_chirho.md.
// This module is lazy. It never creates, replaces or controls any audio object.
export function createRadioSceneChirho(optionsChirho: RadioSceneOptionsChirho): RadioSceneChirho {
	const hostChirho = optionsChirho.host_chirho;
	const faceChirho = optionsChirho.face_chirho;
	const rendererChirho = new RendererChirho({
		alpha: true,
		antialias: true,
		powerPreference: 'low-power'
	});
	rendererChirho.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
	rendererChirho.outputColorSpace = ColorSpaceChirho;
	rendererChirho.toneMapping = ToneMappingChirho;
	rendererChirho.toneMappingExposure = 1.05;
	rendererChirho.shadowMap.enabled = true;
	rendererChirho.shadowMap.type = ShadowMapChirho;
	rendererChirho.domElement.className = 'radio-geometry-chirho';
	rendererChirho.domElement.setAttribute('aria-hidden', 'true');
	hostChirho.insertBefore(rendererChirho.domElement, hostChirho.firstChild);
	const sceneChirho = new SceneChirho();
	const cameraChirho = new CameraChirho(34, 1, 0.1, 150);
	const previousTouchActionChirho = hostChirho.style.touchAction;
	const controlsChirho = new OrbitControlsChirho(cameraChirho, hostChirho);
	controlsChirho.enablePan = false;
	controlsChirho.enableZoom = false;
	controlsChirho.enableDamping = true;
	controlsChirho.dampingFactor = 0.12;
	controlsChirho.minPolarAngle = Math.PI * 0.23;
	controlsChirho.maxPolarAngle = Math.PI * 0.59;
	controlsChirho.rotateSpeed = 0.55;
	controlsChirho.zoomSpeed = 0.6;
	controlsChirho.enabled = false;
	hostChirho.style.touchAction = '';
	const generatorChirho = new PMREMGeneratorChirho(rendererChirho);
	const roomChirho = new RoomEnvironmentChirho();
	let environmentChirho: ReturnType<PMREMGeneratorChirho['fromScene']>;
	try {
		environmentChirho = generatorChirho.fromScene(roomChirho, 0.04);
	} catch (errorChirho) {
		controlsChirho.dispose();
		hostChirho.style.touchAction = previousTouchActionChirho;
		rendererChirho.dispose();
		rendererChirho.forceContextLoss();
		rendererChirho.domElement.remove();
		throw errorChirho;
	} finally {
		roomChirho.dispose();
		generatorChirho.dispose();
	}
	sceneChirho.environment = environmentChirho.texture;
	sceneChirho.environmentIntensity = 0.75;
	sceneChirho.add(new HemisphereLightChirho(0xddeaff, 0x443a2d, 1.2));
	const keyChirho = new DirectionalLightChirho(0xffecd5, 3);
	keyChirho.position.set(-6, 9, 12);
	keyChirho.castShadow = true;
	keyChirho.shadow.mapSize.set(1024, 1024);
	keyChirho.shadow.camera.left = -6;
	keyChirho.shadow.camera.right = 6;
	keyChirho.shadow.camera.top = 10;
	keyChirho.shadow.camera.bottom = -10;
	keyChirho.shadow.camera.near = 0.5;
	keyChirho.shadow.camera.far = 40;
	keyChirho.shadow.normalBias = 0.025;
	sceneChirho.add(keyChirho);
	const rimChirho = new DirectionalLightChirho(0xbed6ff, 2);
	rimChirho.position.set(7, 4, -5);
	sceneChirho.add(rimChirho);
	let modelChirho: RadioModelChirho | undefined;
	let themeChirho = optionsChirho.theme_chirho;
	let paletteChirho = createRadioMaterialsChirho(themeChirho);
	let widthChirho = 1;
	let heightChirho = 1;
	let scaleChirho = 1;
	let activeChirho = false;
	let disposedChirho = false;
	let frameChirho = 0;
	let warmingChirho = true;
	let seenChirho = true;
	let layoutKeyChirho = '';
	const rectChirho = (selectorChirho: string, indexChirho = 0): SurfaceRectChirho => {
		const elementChirho = faceChirho.querySelectorAll<HTMLElement>(selectorChirho)[indexChirho];
		if (!elementChirho) return { x_chirho: 0, y_chirho: 0, width_chirho: 0, height_chirho: 0 };
		let xChirho = 0;
		let yChirho = 0;
		let currentChirho: HTMLElement | null = elementChirho;
		while (currentChirho && currentChirho !== faceChirho) {
			xChirho += currentChirho.offsetLeft;
			yChirho += currentChirho.offsetTop;
			currentChirho = currentChirho.offsetParent as HTMLElement | null;
		}
		return {
			x_chirho: xChirho,
			y_chirho: yChirho,
			width_chirho: elementChirho.offsetWidth,
			height_chirho: elementChirho.offsetHeight
		};
	};
	const fitChirho = (): void => {
		const viewWidthChirho = Math.max(1, hostChirho.clientWidth);
		const viewHeightChirho = Math.max(1, hostChirho.clientHeight);
		if (
			rendererChirho.domElement.style.width !== `${viewWidthChirho}px` ||
			rendererChirho.domElement.style.height !== `${viewHeightChirho}px`
		)
			rendererChirho.setSize(viewWidthChirho, viewHeightChirho);
		cameraChirho.aspect = viewWidthChirho / viewHeightChirho;
		cameraChirho.updateProjectionMatrix();
		const tangentChirho = Math.tan((cameraChirho.fov * Math.PI) / 360);
		const distanceChirho = Math.max(
			(heightChirho * scaleChirho + 1.3) / (2 * tangentChirho),
			7.3 / (2 * tangentChirho * cameraChirho.aspect)
		);
		// Consume and clear previous orbit momentum before placing the camera. Otherwise the
		// Front action keeps moving the live form controls after they have become visible.
		const dampingChirho = controlsChirho.enableDamping;
		controlsChirho.enableDamping = false;
		controlsChirho.update();
		cameraChirho.position.set(distanceChirho * 0.36, distanceChirho * 0.18, distanceChirho);
		controlsChirho.target.set(0, 0, -0.2);
		controlsChirho.minDistance = distanceChirho * 0.58;
		controlsChirho.maxDistance = distanceChirho * 1.8;
		controlsChirho.update();
		controlsChirho.enableDamping = dampingChirho;
	};
	const measureChirho = (): void => {
		widthChirho = Math.max(1, faceChirho.offsetWidth);
		heightChirho = Math.max(1, faceChirho.offsetHeight);
		scaleChirho = 6 / widthChirho;
		const dimensionsChirho: RadioModelOptionsChirho = {
			theme_chirho: themeChirho,
			width_chirho: widthChirho,
			height_chirho: heightChirho,
			book_chirho: rectChirho('.selector-knob-chirho'),
			chapter_chirho: rectChirho('.selector-knob-chirho', 1),
			power_chirho: rectChirho('.power-chirho'),
			display_chirho: rectChirho('.display-chirho'),
			dial_chirho: rectChirho('.dial-track-chirho'),
			speaker_chirho: rectChirho('.speaker-grille-chirho')
		};
		const nextKeyChirho = JSON.stringify(dimensionsChirho);
		if (nextKeyChirho !== layoutKeyChirho) {
			if (modelChirho) {
				sceneChirho.remove(modelChirho.group_chirho);
				modelChirho.disposeChirho();
			}
			modelChirho = createRadioModelChirho(dimensionsChirho, paletteChirho);
			modelChirho.group_chirho.scale.setScalar(scaleChirho);
			modelChirho.group_chirho.traverse((objectChirho) => {
				objectChirho.castShadow = true;
				objectChirho.receiveShadow = true;
			});
			sceneChirho.add(modelChirho.group_chirho);
			layoutKeyChirho = nextKeyChirho;
		}
		fitChirho();
	};
	const projectChirho = (): void => {
		if (!activeChirho) return;
		faceChirho.style.transform = surfaceProjectionChirho(
			cameraChirho,
			widthChirho,
			heightChirho,
			scaleChirho,
			hostChirho.clientWidth,
			hostChirho.clientHeight
		);
		faceChirho.style.visibility = cameraChirho.position.z > 0.3 ? 'visible' : 'hidden';
	};
	const updateKnobsChirho = (): void => {
		const knobsChirho = faceChirho.querySelectorAll<HTMLElement>('.knob-control-chirho');
		const angleChirho = (indexChirho: number): number =>
			Number.parseFloat(
				knobsChirho[indexChirho]?.style.getPropertyValue('--knob-angle-chirho') ?? '0'
			) || 0;
		modelChirho?.setStateChirho({
			book_angle_chirho: angleChirho(0),
			chapter_angle_chirho: angleChirho(1),
			powered_chirho:
				faceChirho.querySelector('.power-chirho')?.getAttribute('aria-pressed') === 'true'
		});
	};
	const requestChirho = (): void => {
		if (!disposedChirho && seenChirho && !document.hidden && !frameChirho)
			frameChirho = requestAnimationFrame(renderChirho);
	};
	function renderChirho(): void {
		frameChirho = 0;
		if (disposedChirho || !seenChirho || document.hidden) return;
		let changingChirho: boolean;
		try {
			changingChirho = controlsChirho.update();
			updateKnobsChirho();
			rendererChirho.render(sceneChirho, cameraChirho);
			projectChirho();
		} catch {
			optionsChirho.on_failure_chirho();
			return;
		}
		if (warmingChirho) {
			warmingChirho = false;
			// The explicit request is ready after a real frame; no automatic FPS assessment remains.
			optionsChirho.on_ready_chirho();
		}
		if (warmingChirho || changingChirho) requestChirho();
	}
	const resizeChirho = new ResizeObserver(() => {
		if (!disposedChirho) {
			try {
				measureChirho();
				requestChirho();
			} catch {
				optionsChirho.on_failure_chirho();
			}
		}
	});
	const mutationChirho = new MutationObserver((entriesChirho) => {
		if (
			entriesChirho.some(
				(entryChirho) =>
					entryChirho.target instanceof Element &&
					entryChirho.target.closest('.knob-control-chirho, .power-chirho')
			)
		)
			requestChirho();
	});
	mutationChirho.observe(faceChirho, {
		subtree: true,
		attributes: true,
		attributeFilter: ['style', 'aria-pressed']
	});
	const intersectionChirho = new IntersectionObserver((entriesChirho) => {
		seenChirho = entriesChirho[0]?.isIntersecting ?? true;
		if (seenChirho) requestChirho();
		else {
			cancelAnimationFrame(frameChirho);
			frameChirho = 0;
		}
	});
	const visibilityChirho = (): void => {
		if (document.hidden) {
			cancelAnimationFrame(frameChirho);
			frameChirho = 0;
		} else requestChirho();
	};
	const downChirho = (eventChirho: PointerEvent): void => {
		if (
			eventChirho.target instanceof Element &&
			eventChirho.target.closest('button,select,input,a,[role="slider"]')
		)
			controlsChirho.enabled = false;
	};
	const upChirho = (): void => {
		controlsChirho.enabled = activeChirho;
	};
	const lostChirho = (eventChirho: Event): void => {
		eventChirho.preventDefault();
		if (!disposedChirho) optionsChirho.on_failure_chirho();
	};
	const focusChirho = (): void => {
		if (cameraChirho.position.z < 1) {
			fitChirho();
			requestChirho();
		}
	};
	hostChirho.addEventListener('pointerdown', downChirho, true);
	window.addEventListener('pointerup', upChirho);
	window.addEventListener('pointercancel', upChirho);
	faceChirho.addEventListener('focusin', focusChirho);
	document.addEventListener('visibilitychange', visibilityChirho);
	rendererChirho.domElement.addEventListener('webglcontextlost', lostChirho);
	controlsChirho.addEventListener('change', requestChirho);
	resizeChirho.observe(hostChirho);
	resizeChirho.observe(faceChirho);
	intersectionChirho.observe(hostChirho);
	const handleChirho: RadioSceneChirho = {
		activateChirho(valueChirho) {
			activeChirho = valueChirho;
			controlsChirho.enabled = valueChirho;
			hostChirho.style.touchAction = valueChirho ? 'pan-y' : previousTouchActionChirho;
			if (!valueChirho) {
				faceChirho.style.removeProperty('transform');
				faceChirho.style.removeProperty('visibility');
			}
			requestChirho();
		},
		themeChirho(valueChirho) {
			if (valueChirho === themeChirho) return;
			modelChirho?.disposeChirho();
			modelChirho = undefined;
			paletteChirho.disposeChirho();
			paletteChirho = createRadioMaterialsChirho(valueChirho);
			layoutKeyChirho = '';
			themeChirho = valueChirho;
			try {
				measureChirho();
				requestChirho();
			} catch {
				optionsChirho.on_failure_chirho();
			}
		},
		frontChirho() {
			fitChirho();
			requestChirho();
		},
		disposeChirho() {
			if (disposedChirho) return;
			disposedChirho = true;
			activeChirho = false;
			cancelAnimationFrame(frameChirho);
			resizeChirho.disconnect();
			intersectionChirho.disconnect();
			mutationChirho.disconnect();
			controlsChirho.dispose();
			hostChirho.removeEventListener('pointerdown', downChirho, true);
			window.removeEventListener('pointerup', upChirho);
			window.removeEventListener('pointercancel', upChirho);
			faceChirho.removeEventListener('focusin', focusChirho);
			document.removeEventListener('visibilitychange', visibilityChirho);
			rendererChirho.domElement.removeEventListener('webglcontextlost', lostChirho);
			modelChirho?.disposeChirho();
			paletteChirho.disposeChirho();
			keyChirho.shadow.dispose();
			environmentChirho.dispose();
			rendererChirho.dispose();
			rendererChirho.forceContextLoss();
			rendererChirho.domElement.remove();
			hostChirho.style.touchAction = previousTouchActionChirho;
			faceChirho.style.removeProperty('transform');
			faceChirho.style.removeProperty('visibility');
		}
	};
	try {
		measureChirho();
		requestChirho();
	} catch (errorChirho) {
		handleChirho.disposeChirho();
		throw errorChirho;
	}
	return handleChirho;
}
