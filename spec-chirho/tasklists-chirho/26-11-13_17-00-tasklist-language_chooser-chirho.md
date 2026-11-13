<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Languages on the web radio

- [x] Reconcile the catalogue landing, ownership and the owner's original request.
- [x] Add a bounded language-loading client and merge built-in languages without duplicating them.
- [x] Teach the player and device preferences about a loaded station and its language; retain followed-place and recovery behavior.
- [x] Add language search, loading/retry states and a language-scoped station dial; keep first-run built-in playback immediate.
- [x] Restore a saved language before playback, preserving saved progress on failed loads; show both required notices for loaded recordings.
- [x] Exercise cancellation, failed/oversized catalogue reads, remembered stations and real browser playback.
- [x] Check desktop/mobile rendering, broad gates and the complete local package; record evidence, close progress and commit owned paths.

## Placement and boundaries

`src/lib/language-chirho/` owns the loading client and language picker. The catalogue module remains the only source-data import. The player owns the current ordinary station and keeps a bounded active station set; the screen owns the selected language. Language files are fetched only for an explicit selection or restoring a remembered dynamic station. No audio is fetched or copied. The language index, station reads and cache have explicit bounds; a superseded selection is cancelled.

The existing 29-station starting dial remains available. Choosing a language limits the dial to that language's built-in and loaded recordings. Returning to built-in stations is explicit. Device preferences carry the language code beside a dynamic station id; no station object or source address is accepted from local storage. Source coverage remains described as publisher-listed, since only one audio file per Davar recording was opened. No push, deployment, cloud resource, native work or provider contact is included.
