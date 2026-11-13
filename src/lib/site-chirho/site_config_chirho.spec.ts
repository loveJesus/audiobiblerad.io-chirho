// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { SITE_DOMAIN_CHIRHO, SITE_NAME_CHIRHO, SITE_URL_CHIRHO } from './site_config_chirho';

describe('site config', () => {
	it('keeps the domain spelling the product name once the dot is removed', () => {
		// The domain is a play on words: a typo in either constant would send people to a
		// domain that is not ours.
		const nameAsOneWordChirho = SITE_NAME_CHIRHO.toLowerCase().replaceAll(' ', '');
		expect(SITE_DOMAIN_CHIRHO.replaceAll('.', '')).toBe(nameAsOneWordChirho);
	});

	it('derives a secure origin with no path from the domain', () => {
		const urlChirho = new URL(SITE_URL_CHIRHO);
		expect(urlChirho.protocol).toBe('https:');
		expect(urlChirho.host).toBe(SITE_DOMAIN_CHIRHO);
		expect(urlChirho.pathname).toBe('/');
		expect(SITE_URL_CHIRHO.endsWith('/')).toBe(false);
	});
});
