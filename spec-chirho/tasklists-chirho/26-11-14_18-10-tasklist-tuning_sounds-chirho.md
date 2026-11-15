<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Single tuning cues and supplied sound effects

The owner reported hearing effects about five times in succession and supplied six WAVs, authorising short 0.5–1.2 second spans. The button-click and knob-turn recordings are interface effects; the other four supply radio tuning textures. Originals stay in the private workspace; source/licence attribution must be accurate before public redistribution. Existing production version and its source/rollback remain pinned.

Placement: fix effect lifecycle in `src/lib/sounds-chirho/`, suppress automatic-recovery retriggers in the player, and exercise the real decoder in `tests-chirho/`. Keep owned audio originals and audition clips in the private audio workspace. The existing catalogue contract is unaffected.

- [x] Inspect current state and diagnose looping plus recovery-triggered repeats. Verify this conversation's registered fleet identity despite the stale inherited shell pane pointer.
- [x] Move the latest six WAVs into the dated private workspace and verify unchanged bytes; preserve the two interface roles separately.
- [x] Reproduce repeated effects with focused controller and real-decoder tests before fixing them. The controller started four cues during one recovery chain; the real decoder kept looping while the chapter was held. Both tests failed before the repair.
- [x] Play a tuning cue once, stop it cleanly, and avoid new effects during automatic recovery. Focused player/sound tests: 33 pass; focused real-decoder browser test: 1 pass. Cancellation/off coverage remains in the existing player suite; disposal now removes the natural-end listener.
- [x] Inspect the supplied files and prepare bounded, quiet, smoothly edged radio spans plus the two interface samples. Nine tuning cuts of 0.6–1.2 seconds plus the full 0.283-second button and 1.061-second knob samples total 414,760 bytes. Cut positions, gain, hashes and a private HTML audition are saved; the six originals are unchanged. Source/licence attribution is still requested once and remains pending.
- [x] Complete final gates with the radio experience: check 0/0, lint, 217 unit/component and 29 browser tests; keep the concrete private audition and red-to-green regression evidence. Public-safe repair source is in `38ceb88`.
- [ ] Establish the supplied recordings' source licence/provenance before public replacement clips. Their originals and the prepared audition stay private. Public deployment follows the existing owner gate.
