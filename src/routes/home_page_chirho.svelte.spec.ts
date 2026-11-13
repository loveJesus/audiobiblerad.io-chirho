// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { SITE_NAME_CHIRHO } from '$lib/site-chirho/site_config_chirho';
import HomePageChirho from './+page.svelte';

describe('home page', () => {
	it('shows the configured name as its top heading', async () => {
		render(HomePageChirho);

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent(SITE_NAME_CHIRHO);
	});
});
