// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { Handle as HandleChirho } from '@sveltejs/kit';

// See spec-chirho/workflows-chirho/experience-chirho/widget_workflow_chirho.md.
export const handle: HandleChirho = async ({ event: eventChirho, resolve: resolveChirho }) => {
	const responseChirho = await resolveChirho(eventChirho);
	if (eventChirho.url.pathname.replace(/\/$/, '') === '/embed-chirho') {
		responseChirho.headers.set('content-security-policy', 'frame-ancestors *');
		responseChirho.headers.delete('x-frame-options');
		responseChirho.headers.set(
			'permissions-policy',
			'autoplay=*, camera=(), microphone=(), geolocation=()'
		);
		responseChirho.headers.set('referrer-policy', 'no-referrer');
	}
	return responseChirho;
};
