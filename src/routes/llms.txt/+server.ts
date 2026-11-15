// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { AGENT_INSTRUCTIONS_CHIRHO } from '$lib/widget-chirho/widget_instructions_chirho';

export function GET() {
	return new Response(AGENT_INSTRUCTIONS_CHIRHO, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'access-control-allow-origin': '*',
			'cache-control': 'public, max-age=300'
		}
	});
}
