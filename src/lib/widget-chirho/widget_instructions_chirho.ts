// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { SITE_URL_CHIRHO } from '$lib/site-chirho/site_config_chirho';
import { widgetMarkupChirho } from './widget_options_chirho';

export const WIDGET_GUIDE_URL_CHIRHO = `${SITE_URL_CHIRHO}/widget-chirho`;
export const AGENT_GUIDE_URL_CHIRHO = `${SITE_URL_CHIRHO}/llms.txt`;
export const WIDGET_DEFAULT_MARKUP_CHIRHO = widgetMarkupChirho({
	theme_chirho: 'minimal',
	autoplay_chirho: false
});

export const AGENT_INSTRUCTIONS_CHIRHO = `# Audio Bible Radio: instructions for an embedding AI agent

Canonical site: ${SITE_URL_CHIRHO}/
Human setup and preview: ${WIDGET_GUIDE_URL_CHIRHO}
This agent guide: ${AGENT_GUIDE_URL_CHIRHO}
Widget endpoint: ${SITE_URL_CHIRHO}/embed-chirho

## Implement

Add this iframe to the requested page using your framework's HTML/JSX equivalent. It needs no API key, account, npm package, audio proxy or host-side JavaScript. Use the iframe, not a copied player or a scraped audio URL.

\`\`\`html
${WIDGET_DEFAULT_MARKUP_CHIRHO}
\`\`\`

Keep the width fluid. Reserve at least 320 CSS pixels of width and 760 pixels of height; the iframe can scroll for longer source notices. Set a taller height if your chosen skin or recording needs it. Keep the player controls and its visible recording credits inside the iframe unobscured.

## URL options

- theme_chirho=minimal|digital|field|cyberpunk. Invalid values use the default. The configured theme is applied on opening; listeners can change it.
- language_chirho=<catalogue language tag>, such as en, es, hi, fr or sw. Omit it to use the widget's saved choice or the browser language. A supplied language takes priority over a saved different language. The selected language's cleared recordings are loaded on demand.
- autoplay_chirho=1 requests audible autoplay. It is off by default in the widget. allow="autoplay" delegates permission but cannot override browser settings or the parent page's Permissions-Policy. If blocked, the visitor presses On. Do not work around the policy with muted Scripture or repeated play calls.

Example: ${SITE_URL_CHIRHO}/embed-chirho?theme_chirho=field&language_chirho=es

Unknown parameters are ignored. Arbitrary audio, HTML, scripts, callback URLs and parent origins cannot be supplied. Language and theme choices never provide an audio address or licence.

## Allow outside embedding

Our widget response explicitly allows framing by other origins via Content-Security-Policy: frame-ancestors * and does not send a conflicting X-Frame-Options header. No domain allowlist, login or site-unlock request is required from us.

If YOUR page has Content-Security-Policy, add https://audiobiblerad.io to its existing frame-src directive (or add frame-src with its existing required sources). Keep the other sources your site needs. Example: frame-src 'self' https://audiobiblerad.io; . Do not replace your entire CSP with this one directive. frame-ancestors controls who may embed a page; frame-src controls what your page may embed. CORS is not the switch for iframe navigation. Source audio stays inside our frame; your parent page does not need to proxy it or add each publisher to its media-src.

For optional automatic playback, do not set a parent Permissions-Policy that forbids this origin's autoplay. The iframe's allow="autoplay" attribute is still required. Test an actual On gesture as the fallback. Keep the frame unsandboxed, as in the snippet. If your platform adds sandbox, it must allow scripts, same-origin operation and user-activated external links (allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox); otherwise playback, preferences or source/licence links may fail. No microphone, camera, geolocation or top-page navigation permission is required.

WordPress: use a Custom HTML block; other page builders may need an HTML/embed component. If a platform strips iframe tags, use that platform's supported embed component. In React/JSX, convert style to an object and referrerpolicy to referrerPolicy; keep the same src, title, dimensions and allow value.

## Recording terms

Audio is free to listen to and streams directly from each publisher's host. Do not download, mirror, bundle, cache for offline use or re-host Scripture recordings. Each recording retains its own licence; the player's source and licence links describe it. Keep every required copyright and attribution notice visible inside the player.

Davar Audio Bibles recordings are non-commercial only: do not use them for a commercial purpose. The embedding page must not sell access to, charge for or put a paywall around this audio. Other recordings have their own CC0, public-domain or Creative Commons terms. GPL licensing of the player and generated artwork does not grant rights to the recordings. Review the selected source's terms before deploying to a commercial context.

## Verify before calling the integration complete

1. Load the iframe from the actual host page, not only by opening the widget URL in a tab. Confirm there is no framing, CSP, mixed-content or blocked-script error.
2. At 320px and a desktop width, confirm On, the language/version labels, book/chapter controls and recording credits are reachable without horizontal clipping.
3. Press On. Confirm the real audio element plays and its time advances, then press Off and confirm it stops. Browser playing events do not prove physical speaker output.
4. Change a language or chapter and confirm the label and dial agree. No host-side access to the frame DOM is needed or available across origins.
5. Confirm source/licence notices remain present. Allow iframe scrolling or increase its height for long notices; do not crop them away.
6. Third-party storage can be denied or partitioned by the browser. Listening must still work; preferences are best effort. The widget uses a separate fixed storage namespace from the full radio.

The widget posts no messages to its parent and accepts no postMessage control commands. Do not add a permissive host-side message listener or a proxy to make it work. No additional provider, credential or signup is required.
`;
