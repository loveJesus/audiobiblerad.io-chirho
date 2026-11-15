<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Publish the radio and outside-site widget

Owner authority: publish the reviewed update, build an embeddable/widget version with a URL and instructions suitable for another AI agent, explicitly allow outsiders to embed it, and send the instructions through the existing messaging app once it is ready. Recipient and exact outgoing message stay private.

Placement: reuse the shared radio controller in a compact `/embed-chirho` route. Put the copyable configurator and instructions at `/widget-chirho` and a machine-readable guide at `/llms.txt`. Root owns these routes, `src/lib/widget-chirho/`, shared experience integration, response framing headers, browser verification and the release record. Existing catalogue/theme exports and the previously verified release remain intact. No new dependency or provider is needed.

- [x] Inspect actual public framing behavior, package/release state and messaging capability.
- [x] Build the compact radio route with validated theme/language options, isolated preferences and visible recording credits.
- [x] Add the public setup page, copyable iframe, agent instructions and clear parent-site CSP/autoplay guidance.
- [x] Explicitly allow cross-origin widget framing and prove it in a real iframe on a separate origin, including playback, unavailable storage and failure behavior.
- [ ] Complete rendered desktop/mobile refinement and appropriate source, browser, package and secret checks; commit and push the authorized source.
- [ ] Preserve the current deployment preimage, publish only this project's Worker, and verify normal HTTPS assets, instructions and real outside-origin widget playback.
- [ ] Send the verified instructions once to the authorized recipient, retain the exact private send/readback record, and report actual delivery status.
