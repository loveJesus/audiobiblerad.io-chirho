// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect, test } from '@playwright/test';
import { SITE_NAME_CHIRHO } from '../src/lib/site-chirho/site_config_chirho';

test('the built worker serves the home page under the configured name', async ({ page }) => {
	const responseChirho = await page.goto('/');

	expect(responseChirho?.status()).toBe(200);
	await expect(page).toHaveTitle(SITE_NAME_CHIRHO);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(SITE_NAME_CHIRHO);
});
