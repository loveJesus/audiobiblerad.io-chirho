// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { CATALOGUE_CHIRHO } from '$lib/catalogue-chirho/catalogue_chirho';

// Cleared public metadata only; never add provider secrets or restricted metadata.
// Keep the handler responsible for headers: extensionless prerendered assets lose JSON/CORS headers.
const CATALOGUE_BODY_CHIRHO = JSON.stringify(CATALOGUE_CHIRHO);
export function GET() {
	return new Response(CATALOGUE_BODY_CHIRHO, {
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'public, max-age=300',
			'access-control-allow-origin': '*'
		}
	});
}
