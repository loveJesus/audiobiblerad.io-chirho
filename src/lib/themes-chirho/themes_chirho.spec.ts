// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RADIO_THEMES_CHIRHO } from './themes_chirho';

const STATIC_DIR_CHIRHO = fileURLToPath(new URL('../../../static', import.meta.url));
const ART_DIR_CHIRHO = join(STATIC_DIR_CHIRHO, 'images-chirho', 'radios-chirho');
const STYLES_CHIRHO = readFileSync(new URL('./themes_chirho.css', import.meta.url), 'utf8').replace(
	/\/\*[\s\S]*?\*\//g,
	''
);
/** One picture may not outweigh a few seconds of speech on a slow phone. */
const FILE_LIMIT_BYTES_CHIRHO = 250 * 1024;
const SKIN_LIMIT_BYTES_CHIRHO = 600 * 1024;

/**
 * The colours a skin sets, read from the stylesheet the site really ships. Only a skin's own
 * colour block counts: rules further down re-point a colour for one surface and name no value.
 */
function tokensChirho(idChirho: string): Record<string, string> {
	const skinChirho = `[data-radio-theme-chirho='${idChirho}']`;
	const foundChirho: Record<string, string> = {};
	for (const [, selectorChirho, bodyChirho] of STYLES_CHIRHO.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selectorsChirho = selectorChirho.split(',').map((partChirho) => partChirho.trim());
		if (
			!selectorsChirho.includes(skinChirho) ||
			!selectorsChirho.includes(`:root:has(${skinChirho})`)
		)
			continue;
		for (const [, nameChirho, valueChirho] of bodyChirho.matchAll(
			/(--radio-[a-z-]+-chirho)\s*:\s*([^;]+);/g
		))
			foundChirho[nameChirho] = valueChirho.trim();
	}
	return foundChirho;
}

function luminanceChirho(hexChirho: string): number {
	const [redChirho, greenChirho, blueChirho] = [1, 3, 5].map((startChirho) => {
		const levelChirho = parseInt(hexChirho.slice(startChirho, startChirho + 2), 16) / 255;
		return levelChirho <= 0.04045 ? levelChirho / 12.92 : ((levelChirho + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * redChirho + 0.7152 * greenChirho + 0.0722 * blueChirho;
}

/** WCAG contrast ratio of two six-digit hex colours. */
function contrastChirho(firstChirho: string, secondChirho: string): number {
	const [lighterChirho, darkerChirho] = [
		luminanceChirho(firstChirho),
		luminanceChirho(secondChirho)
	]
		.sort((leftChirho, rightChirho) => leftChirho - rightChirho)
		.reverse();
	return (lighterChirho + 0.05) / (darkerChirho + 0.05);
}

describe('radio skins', () => {
	it('offers each agreed skin once, because a saved choice names a skin by its id', () => {
		expect(RADIO_THEMES_CHIRHO.map((themeChirho) => themeChirho.id_chirho)).toEqual([
			'minimal',
			'digital',
			'field',
			'cyberpunk'
		]);
	});

	it('points only at artwork that is really shipped', () => {
		const pathsChirho = [
			...RADIO_THEMES_CHIRHO.flatMap((themeChirho) => [
				themeChirho.body_image_chirho,
				themeChirho.background_image_chirho
			]).filter((pathChirho): pathChirho is string => pathChirho !== null),
			...[...STYLES_CHIRHO.matchAll(/url\('([^']+)'\)/g)].map(([, pathChirho]) => pathChirho)
		];
		expect(
			pathsChirho.filter((pathChirho) => !existsSync(join(STATIC_DIR_CHIRHO, pathChirho)))
		).toEqual([]);
	});

	it('keeps every skin light enough to follow the first sound, never to delay it', () => {
		const tooHeavyChirho: string[] = [];
		for (const skinChirho of readdirSync(ART_DIR_CHIRHO, { withFileTypes: true })) {
			if (!skinChirho.isDirectory()) continue;
			let totalChirho = 0;
			for (const fileChirho of readdirSync(join(ART_DIR_CHIRHO, skinChirho.name))) {
				const bytesChirho = statSync(join(ART_DIR_CHIRHO, skinChirho.name, fileChirho)).size;
				totalChirho += bytesChirho;
				if (bytesChirho > FILE_LIMIT_BYTES_CHIRHO)
					tooHeavyChirho.push(`${skinChirho.name}/${fileChirho}: ${bytesChirho} bytes`);
			}
			if (totalChirho > SKIN_LIMIT_BYTES_CHIRHO)
				tooHeavyChirho.push(`${skinChirho.name}: ${totalChirho} bytes in all`);
		}
		expect(tooHeavyChirho).toEqual([]);
	});

	it('keeps live words and marks readable in every skin', () => {
		const floorsChirho: readonly (readonly [string, string, number])[] = [
			['--radio-page-ink-chirho', '--radio-page-chirho', 7],
			['--radio-ink-chirho', '--radio-panel-chirho', 4.5],
			['--radio-accent-chirho', '--radio-panel-chirho', 3],
			['--radio-screen-ink-chirho', '--radio-screen-chirho', 7],
			['--radio-screen-dim-chirho', '--radio-screen-chirho', 4.5],
			['--radio-screen-accent-chirho', '--radio-screen-chirho', 3]
		];
		// What only an artwork skin sets. Minimal keeps the page's own focus ring and power button.
		const artFloorsChirho: readonly (readonly [string, string, number])[] = [
			['--radio-focus-chirho', '--radio-page-chirho', 3],
			['--radio-panel-focus-chirho', '--radio-panel-chirho', 3],
			['--radio-button-ink-chirho', '--radio-button-cap-chirho', 4.5]
		];
		const failuresChirho: string[] = [];
		for (const { id_chirho: idChirho } of RADIO_THEMES_CHIRHO) {
			const skinChirho = tokensChirho(idChirho);
			for (const [frontChirho, backChirho, floorChirho] of [
				...floorsChirho,
				...(idChirho === 'minimal' ? [] : artFloorsChirho)
			]) {
				const coloursChirho = [skinChirho[frontChirho], skinChirho[backChirho]];
				if (!coloursChirho.every((colourChirho) => /^#[0-9a-f]{6}$/.test(colourChirho ?? ''))) {
					failuresChirho.push(`${idChirho}: ${frontChirho} or ${backChirho} is not a hex colour`);
					continue;
				}
				const ratioChirho = contrastChirho(coloursChirho[0], coloursChirho[1]);
				if (ratioChirho < floorChirho)
					failuresChirho.push(
						`${idChirho}: ${frontChirho} on ${backChirho} is ${ratioChirho.toFixed(2)}, below ${floorChirho}`
					);
			}
		}
		expect(failuresChirho).toEqual([]);
	});
});
