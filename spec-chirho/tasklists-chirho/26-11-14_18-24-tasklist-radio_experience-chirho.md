<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Four radio experiences

The owner's current direction is the radio as the interface, with integrated label dropdowns and synchronized controls. Build four skins: Minimal, 1980s Digital, steel Field Radio and futuristic Cyberpunk. The three character radios use GPT Image 2.6 artwork; only Minimal may remain code drawn. World settings and weather motion belong to the skin. Existing Runware tokens are authorised for suitable animation work, not a requirement to consume credits. Claude is explicitly invited to help design.

Architecture: Root owns `src/routes/`, reusable controls under `src/lib/controls-chirho/`, first-run selection under `src/lib/language-chirho/`, player/prefs and their verification. Claude owns `src/lib/themes-chirho/`, theme artwork under `static/images-chirho/radios-chirho/`, and private art job records. Keep one shared playback controller across skins, with raster art behind real controls. Never bake working values into an image. Preserve saved listening position, recording credits, source licences and the verified live release.

- [x] Agree the theme/art contract with Claude, verify actual GPT Image 2.6 access and bounded job cost, and land three responsive radio artworks plus their world settings.
- [x] Make the radio the complete main interface: On/Off, integrated language/version label selects and FM dial, book/chapter knob dials and label selects, and compact (?) About/credits.
- [x] Add first-run browser-language matching, documented translation defaults and verified narrator preferences without hiding other recordings or replacing saved choices.
- [x] Attempt audible autoplay where allowed; otherwise show the gently moving PRESS HERE cue at On. Keep blocked autoplay distinct from network/media failure, and preserve Off and device storage across failure paths.
- [x] Add all four skins, remembered theme choice and bounded weather/motion that respects reduced-motion preferences and never gates first Scripture.
- [x] Integrate the one-shot sound repair, keep automatic recovery and chapter continuation quiet, and prepare the supplied clips privately with distinct tuning/click/knob roles.
- [x] Complete three rendered refinement passes, keyboard and accessible control semantics, focused failure checks and final broad gates: check 0/0, lint, 217 unit/component tests, 29 built-worker browser tests, nine reproducible sounds and five real advancing upstream streams. Retain the red cases and exact public art provenance.
- [x] Commit the coordinator implementation as `38ceb88`; designer assets and water motion are `c29a1e1` and `10eb650`, with licence note `6bb517e`. No production change is part of these commits.
- [ ] Confirm the supplied WAVs' source licence/provenance, then integrate and publish the prepared replacement effects under their actual terms. Until then the public package retains the original CC0 sounds.
- [x] L.J. authorized publication with the widget on 2026-11-14. Published Worker `c1a2a7a3-e27a-4c65-9143-2bc5e14b8018` from source `418b5f9`, with 437 hosted assets matched, five actual full-radio streams and real source playback in a second-origin widget. Previous release version and package are preserved; see `widget-release-chirho` evidence.

Evidence: `spec-chirho/evidence-chirho/radio-experience-chirho/verification_chirho.json`, `build_inventory_chirho.json` and `live_playback_chirho.json`. The final package has 433 files and 2,801,180 bytes, including fifteen generated radio images and no source Scripture or supplied sound recordings. Private rendered proofs and the eleven-clip audition are retained locally. Browser proof is not acoustic, physical-device or full-library acceptance.
